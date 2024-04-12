import { DrawerContent } from "@adminjs/design-system";
import { ActionProps, BasePropertyComponent } from "adminjs";
import React, { useEffect } from "react";

const divList = ["major_advisor", "end", "dislike"];
const YesColor = "rgb(194, 0, 18)"; // 붉은색
const NoColor = "rgb(48, 64, 214)"; // 푸른색

const Show: React.FC<ActionProps> = (props) => {
  const { resource, record, action } = props;
  const properties = [...resource.showProperties];
  const propertiesBeforeImage = properties;
  const propertiesAfterImage = properties.splice(6);
  const getActionElementCss = (
    resourceId: string,
    actionName: string,
    suffix: string
  ) => `${resourceId}-${actionName}-${suffix}`;
  const contentTag = getActionElementCss(
    resource.id,
    action.name,
    "drawer-content"
  );
  const imagePaths =
    record?.params &&
    Object.entries(record.params)
      .filter((p) => p[0].includes("image"))
      .map((p) => p[1]).flat();
  useEffect(() => {
    // expired 속성의 chip 색상 적용
    const expiredMarker: HTMLSpanElement = window.document.querySelector(
      'section[data-css="events-show-expired"] > section > span'
    );
    const color = record.params.expired ? YesColor : NoColor;
    expiredMarker.style.setProperty("color", color, "important");
    expiredMarker.style.setProperty("border-color", color, "important");
  }, []);
  return (
    <DrawerContent data-css={contentTag}>
      <div className="properties">
        {propertiesBeforeImage.map((property) => (
          <>
            <BasePropertyComponent
              key={property.propertyPath}
              where="show"
              property={property}
              resource={resource}
              record={record}
            />
            {divList.includes(property.propertyPath) ? <br></br> : null}
          </>
        ))}
      </div>
      <div className="image">
        {!!imagePaths?.length &&
          imagePaths.map((img) => (
            <img src={window.location.origin + "/events/" + img}></img>
          ))}
      </div>
      <div className="properties">
        {propertiesAfterImage.map((property) => (
          <>
            <BasePropertyComponent
              key={property.propertyPath}
              where="show"
              property={property}
              resource={resource}
              record={record}
            />
            {divList.includes(property.propertyPath) ? <br></br> : null}
          </>
        ))}
      </div>
    </DrawerContent>
  );
};

export default Show;
