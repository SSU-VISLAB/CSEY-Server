import { DrawerContent } from '@adminjs/design-system';
import { ActionProps, BasePropertyComponent } from 'adminjs';
import React, { useEffect } from 'react';

const divList = ["major_advisor", "end", "dislike"];
const Yes = 'rgb(194, 0, 18)'; // 붉은색
const No = 'rgb(48, 64, 214)'; // 푸른색

const Show: React.FC<ActionProps> = (props) => {
  const { resource, record, action } = props;
  const properties = resource.showProperties;
  
  const getActionElementCss = (resourceId: string, actionName: string, suffix: string) => `${resourceId}-${actionName}-${suffix}`;
  const contentTag = getActionElementCss(resource.id, action.name, 'drawer-content');

  useEffect(() => {
    // ended 속성의 chip 색상 적용
    const endedMarker = window.document.querySelector('section[data-css="events-show-ended"] > section > span');
    endedMarker.style.setProperty('color', record.params.ended ? Yes : No, 'important');
    endedMarker.style.setProperty('border-color', record.params.ended ? Yes : No, 'important');
  }, []);

  return (
    <DrawerContent data-css={contentTag}>
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

    </DrawerContent>
  )
}

export default Show