import * as core from '@actions/core';
import parse from 'csv-parse/lib/sync';

export const processFiles = async (
  summary: { data: string | Object; title: string },
  files: { data: string | Object; title: string }[],
): Promise<{ [key in string]: string }[]> => {
  if (!summary) {
    core.setFailed('summary file is invalid');
    throw new Error('');
  }

  const mode = core.getInput('mode') || 'single';
  const idColumn = core.getInput('id') || 'id';
  const summaryObject: { [key in string]: string }[] =
    typeof summary.data === 'string'
      ? parse(summary.data, {
          columns: true,
        })
      : summary.data;
  files.map(file => {
    if (!file) {
      core.setFailed('flag file is invalid');
      throw new Error('');
    }
    const data =
      typeof file.data === 'string'
        ? parse(file.data, {
            columns: true,
          })
        : file.data;

    data.map((row: { [key in string]: string }) => {
      const keys = Object.keys(row).filter(item => item !== idColumn);
      const id = row[idColumn];
      keys.map(key => {
        const name = () => {
          switch (mode) {
            case 'single':
              return file.title;
            case 'multiple':
              return `${file.title}_${key}`;
            default:
              return 'null';
          }
        };
        const index = summaryObject.findIndex(item => item[idColumn] === id);
        if (index > -1) {
          summaryObject[index][name()] = row[key];
        } else {
          core.warning('no id found!');
        }
      });
    });
  });
  return summaryObject;
};
