import React from 'react';

const placeholder = `
<h2>click "Go!" to create an activity</h2>
`;

export const Preview = (props: {document?: string}) => {
  const dataUrl = `data:text/html;charset=utf-8,${encodeURIComponent(props.document || placeholder)}`;

  return <iframe className="preview-iframe" title="activity preview" src={dataUrl} />;
};
