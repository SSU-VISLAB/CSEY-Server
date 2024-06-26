import { Box, Button, DrawerContent, DrawerFooter, Icon } from "@adminjs/design-system";
import {
  ActionProps,
  BasePropertyComponent,
  RecordJSON,
  useCurrentAdmin,
  useRecord,
  useTranslation
} from "adminjs";
import React, { FC, useEffect } from "react";
import { useNavigate } from "react-router";

const appendForceRefresh = (url: string, search?: string): string => {
  const searchParamsIdx = url.lastIndexOf("?");
  const urlSearchParams = searchParamsIdx !== -1 ? url.substring(searchParamsIdx + 1) : null;

  const oldParams = new URLSearchParams(search ?? urlSearchParams ?? window.location.search ?? "");
  const shouldIgnoreOldParams = new URLSearchParams(urlSearchParams || "").get("ignore_params") === "true";
  const newParams = shouldIgnoreOldParams ? new URLSearchParams("") : new URLSearchParams(oldParams.toString());

  newParams.set("refresh", "true");

  const newUrl = searchParamsIdx !== -1 ? url.substring(0, searchParamsIdx) : url;

  return `${newUrl}?${newParams.toString()}`;
};

const Edit: FC<ActionProps> = (props) => {
  const { record: initialRecord, resource, action } = props;
  const [currentAdmin, setCurrentAdmin] = useCurrentAdmin();
  const {role} = currentAdmin as any
  const { record, handleChange, submit: handleSubmit, loading, setRecord } = useRecord(initialRecord, resource.id);
  const { translateButton } = useTranslation();
  const navigate = useNavigate();
  const getActionElementCss = (resourceId: string, actionName: string, suffix: string) => `${resourceId}-${actionName}-${suffix}`
  // const value = record.params?.[property.path]
  // const error = record.errors && record.errors[property.path]
  // console.log(props)
  useEffect(() => {
    if (initialRecord) {
      setRecord(initialRecord);
    } else {
      setRecord({...record, params: {major_advisor: role, date: new Date().toISOString()}})
    }
  }, [initialRecord]);

  if (role != "관리자") {
    const majorProp = resource.editProperties.find(p => p.name == 'major_advisor');
    if (majorProp && majorProp.availableValues) {
      majorProp.availableValues = majorProp.availableValues.filter(p => p.label == role)
    }
  }
  const submit = (event: React.FormEvent<HTMLFormElement>): boolean => {
    event.preventDefault();
    handleSubmit().then((response) => {
      if (response.data.redirectUrl) {
        navigate(appendForceRefresh(response.data.redirectUrl));
      }
    });
    return false;
  };

  const contentTag = getActionElementCss(resource.id, action.name, "drawer-content");
  const formTag = getActionElementCss(resource.id, action.name, "form");
  const footerTag = getActionElementCss(resource.id, action.name, "drawer-footer");
  const buttonTag = getActionElementCss(resource.id, action.name, "drawer-submit");
  return (
    <Box as="form" onSubmit={submit} flex flexDirection="column" data-css={formTag}>
      <DrawerContent data-css={contentTag}>
        {resource.editProperties.map((property) => (
          <BasePropertyComponent
            key={property.propertyPath}
            where="edit"
            onChange={handleChange}
            property={property}
            resource={resource}
            record={record as RecordJSON}
          />
        ))}
      </DrawerContent>
      <DrawerFooter data-css={footerTag}>
        <Button variant="contained" type="submit" data-css={buttonTag} data-testid="button-save" disabled={loading}>
          {loading ? <Icon icon="Loader" spin /> : null}
          {translateButton("save", resource.id)}
        </Button>
      </DrawerFooter>
    </Box>
  );
};

export default Edit;
