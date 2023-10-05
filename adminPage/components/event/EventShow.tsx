import { DrawerContent } from '@adminjs/design-system';
import { ActionProps, BasePropertyComponent } from 'adminjs';
import React, { useEffect } from 'react';

const divList = ["major_advisor", "end", "dislike"];
const YesColor = 'rgb(194, 0, 18)'; // 붉은색
const NoColor = 'rgb(48, 64, 214)'; // 푸른색

const Show: React.FC<ActionProps> = (props) => {
  const { resource, record, action } = props;
  const properties = resource.showProperties;
  const getActionElementCss = (resourceId: string, actionName: string, suffix: string) => `${resourceId}-${actionName}-${suffix}`;
  const contentTag = getActionElementCss(resource.id, action.name, 'drawer-content');
  useEffect(() => {
    // ended 속성의 chip 색상 적용
    const endedMarker = window.document.querySelector('section[data-css="events-show-ended"] > section > span');
    const color = record.params.ended ? YesColor : NoColor;
    endedMarker.style.setProperty('color', color, 'important');
    endedMarker.style.setProperty('border-color', color, 'important');
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
        {record.params.image ? <img src={window.location.origin + '/' + record.params.image}></img> : null}
      </div>
    </DrawerContent>
  )
}

export default Show