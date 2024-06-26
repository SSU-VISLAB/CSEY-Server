import { DrawerContent } from "@adminjs/design-system";
import { ActionProps, BasePropertyComponent } from "adminjs";
import React, { useEffect } from "react";

const divList = ["id", "expired", "title", "dislike", "content", "file"]; // 해당 속성 만나면 개행
const YesColor = "rgb(194, 0, 18)"; // 붉은색
const NoColor = "rgb(48, 64, 214)"; // 푸른색

const Show: React.FC<ActionProps> = (props) => {
  const { resource, record, action } = props;
  const properties = resource.showProperties;
  const imagePaths =
    record?.params &&
    Object.entries(record.params)
      .filter((p) => p[0].includes("image"))
      .map((p) => p[1]).flat();
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
  useEffect(() => {
    // ended 속성의 chip 색상 적용
    const priorityMarker: HTMLSpanElement = window.document.querySelector(
      'section[data-css="notices-show-priority"] > section > span'
    );
    const color = record.params.priority == "긴급" ? YesColor : NoColor;
    priorityMarker.style.setProperty("color", color, "important");
    priorityMarker.style.setProperty("border-color", color, "important");
    priorityMarker.style.setProperty("background-color", "white", "important");
  }, []);
  useEffect(() => {
    // ended 속성의 chip 색상 적용
    const priorityMarker: HTMLSpanElement = window.document.querySelector(
      'section[data-css="notices-show-expired"] > section > span'
    );
    const color = record.params.expired ? YesColor : NoColor;
    priorityMarker.style.setProperty("color", color, "important");
    priorityMarker.style.setProperty("border-color", color, "important");
    priorityMarker.style.setProperty("background-color", "white", "important");
  }, []);

  return (
    <DrawerContent data-css={contentTag}>
      <div className="properties">
        {properties.map((property) => (
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
            <img src={window.location.origin + "/notices/" + img}></img>
          ))}
      </div>
    </DrawerContent>
  );
};

export default Show;
