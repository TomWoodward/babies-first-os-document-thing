import React from 'react';
import {AnyOrnLocateResponse} from '@openstax/orn-locator';
import styled from 'styled-components';
import { FetchState, stateHasData, fetchError, fetchSuccess, fetchLoading } from "@openstax/ts-utils/fetch";
import { assertString, assertDefined } from "@openstax/ts-utils/assertions";
import * as UI from '@openstax/ui-components';
import {OrnSearch} from './OrnSearch';

const Forms = UI.Forms.Controlled;

export interface InputFields {
  instructions: string;
  promptTemplate: string;
  content: AnyOrnLocateResponse[]; 
}

const defaultPrompt = `{{content}}

{{#document}}
Modify the following HTML document according to the given instructions:

**Document:**
{{document}}
{{/document}}

**Instructions:**
{{instructions}}

**Output:**
Please provide the result HTML document.`

const AddContent = () => {
  const listState = Forms.useFormListHelpers();

  return <OrnSearch
    onSelect={(record) => listState.addRecord(record)}
    help="Search for OpenStax sections to include in the context."
  />;
};

const ContentInfo = () => {
  const resource = Forms.useFormHelpers().data;

  const title = 'contextTitle' in resource
    ? resource.contextTitle : 'title' in resource ? resource.title
    : resource.orn;

  return <span style={{flex: 1}}>
    {title}
  </span>;
};

const FormRow = styled(Forms.FormSection)`
  display: flex;
  flex-direction: row;

  > *:not(:first-child) {
    margin-top: 0;
    margin-left: 5px;
  }
`;

export const Input = (props: {onSubmit: (data: InputFields) => Promise<void>}) => {
  const [state, setState] = React.useState<FetchState<InputFields, string>>(fetchSuccess({
    content: [],
    promptTemplate: defaultPrompt,
    instructions: "Generate a classroom activity about this textbook section"
  }));

  const onSubmit = async(data: Partial<InputFields>) => {
    setState(previous => fetchLoading(previous));
    await props.onSubmit({
      content: assertDefined(data.content),
      instructions: assertString(data.instructions),
      promptTemplate: assertString(data.promptTemplate),
    });
    setState(previous => stateHasData(previous) ? fetchSuccess(previous.data) : fetchError('something went wrong'));
  }

  return <Forms.Form className="input-container" onSubmit={onSubmit} state={state}>
    <Forms.List name="content">
      <Forms.ListItems>
        <FormRow
          style={{borderLeft: '2px solid #ccc', marginLeft: '0.5rem', paddingLeft: '0.5rem'}}
        >
          <ContentInfo />
          <Forms.ListRecordRemoveButton>remove</Forms.ListRecordRemoveButton>
        </FormRow>
      </Forms.ListItems>
      <AddContent />
    </Forms.List>

    <Forms.TextArea
      label="Instructions"
      name="instructions"
      rows={5}
    />

    <button type="submit">Go!</button>

    <details>
      <summary>advanced</summary>
      <Forms.TextArea
        label="Prompt Template"
        name="promptTemplate"
        rows={5}
      />
    </details>
  </Forms.Form>;
};
