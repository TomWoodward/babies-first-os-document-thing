import React from 'react';
import {AnyOrnLocateResponse} from '@openstax/orn-locator';
import './App.css';
import {Preview} from './Preview';
import {Input, InputFields} from './Input';
import {generate} from './inferrence';

const archiveUrl="https://openstax.org/apps/archive"

function App() {
  const [document, setDocument] = React.useState<string>();

  const onSubmit = async({promptTemplate, ...data}: InputFields) => {

    const content = (await Promise.all(data.content.map(resolveContent))).join('\n');
    const templateData = {...data, document, content};

    // this is intended to be placeholder for https://handlebarsjs.com/guide/
    // but i think probably it would be easier to just use https://lodash.com/docs/4.17.15#template
    const template = templateData.document
      ? promptTemplate.replace(/{{[#/]{1}document}}/, '')
      : promptTemplate.replace(/{{#document}}[\s\S]+{{\/document}}/, '');

    const promptContent = Object.entries(templateData).reduce(
      (result, [key, value]) => result.replace(`{{${key}}}`, value ?? ''),
      template
    ).trim();

    const result = await generate(promptContent);

    console.log(result);
    setDocument(result);
  };

  return <>
    <Preview document={document} />
    <Input onSubmit={onSubmit} />
  </>;
}

export default App;

const domParser = new DOMParser();
async function resolveContent(record: AnyOrnLocateResponse) {
  if (record.type !== 'book:page') {
    return '';
  }

  const [,bits] = record.versionedOrn.split('/book:page/');
  const [book, pipeline, page] = bits.split(':');
  const contentUrl = `${archiveUrl}/${pipeline}/contents/${book}:${page}.xhtml`;

  const html = await fetch(contentUrl).then(response => response.text())

  const domNode = domParser.parseFromString(html, 'text/html');

  return domNode.body.innerHTML;
}
