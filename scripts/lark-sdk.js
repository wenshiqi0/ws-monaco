const path = require('path');
const request = require('request');
const fsExtra = require('fs-extra');

const endpoint = 'https://lark.alipay.com/api/v2';
const apiUrl = `${endpoint}/repos/tiny-site/api/docs`;
const compUrl = `${endpoint}/repos/tiny-site/component/docs`;
const tmp = './tmp';

fsExtra.removeSync(tmp);

const convertTableToMarkdown = (str) => {
  return str.replace(/<div>|<\/div>/g, '')
    .replace(/<tr><td>|<\/td><td>/g, ' | ')
    .replace(/<\/td><\/tr>/g, ' |\r')
    .replace(/<table>|<\/tbody><\/table>|<tbody>/g, '\r')
    .replace(/<thead>[\s\S][^<]+<\/thead>/g, (match, p1, p2, p3, offset, string) => {
      const spliter = [];
      const len = match.match(/\|/gi).length - 1;
      for (let i = 0; i < len; i++) {
        spliter.push('| --- ');
      }
      return `${match.replace(/<thead>|<\/thead>/g, '')} ${spliter.join('')}|`
    });
};

request({ url: apiUrl, json: true }, (err, res) => {
  res.body.data.forEach(doc => {
    request({ url: `${apiUrl}/${doc.slug}?raw=1`, json: true }, (err, res) => {
      fsExtra.outputFileSync(path.resolve(tmp, `api/${doc.slug}.md`), convertTableToMarkdown(`---\ntitle: ${doc.slug}\nfrom: lark\n---\n` + res.body.data.body));
    });
  });
});

request({ url: compUrl, json: true }, (err, res) => {
  res.body.data.forEach(doc => {
    request({ url: `${compUrl}/${doc.slug}?raw=1`, json: true }, (err, res) => {
      fsExtra.outputFileSync(path.resolve(tmp, `component/${doc.slug}.md`), convertTableToMarkdown(`---\ntitle: ${doc.slug}\nfrom: ${doc.slug}\n---\n` + res.body.data.body));
    });
  });
});
