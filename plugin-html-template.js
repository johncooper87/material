import path from 'path';
import { readFileSync } from 'fs';
import { walk } from 'estree-walker';
import { minify } from 'html-minifier';

const htmlMinifierOptions = {
  collapseWhitespace: true,
  collapseInlineTagWhitespace: true,
  includeAutoGeneratedTags: false,
  minifyCSS: {
    format: {
      wrapAt: 200
    }
  },
  removeComments: true,
  maxLineLength: 210
};

export default function htmlTemplateLoader() {

	return {

    name: 'html-template',

    transform(code, id) {

      const ast = this.parse(code);
      let _code = code;
      const addWatchFile = this.addWatchFile;
      let shift = 0;
      let templateClassImport = `import HTMLTemplate from '@internals/HTMLTemplate';`;
      const srcPath = path.relative(path.dirname(id), __dirname + '/src').replace(/\\/g, '/');
      let iconStoreImport = `import IconStore from '${srcPath}/IconStore';`;
      let totalUnnamedSpecifiers = 0;

      walk(ast, {
        enter: function(node) {
          if (node.type === 'ImportDeclaration') {

            // @ts-expect-error
            const { specifiers, source, start, end } = node;
            let specifier = specifiers[0];
            if (specifier && specifier.local.name === 'IconStore') iconStoreImport = '';

            const isSVG = source.value.slice(-4) === '.svg';
            if (source.value.slice(-5) === '.html' || isSVG) {
              const filepath = path.resolve(path.dirname(id), source.value);
              addWatchFile(filepath);
              const dirname = path.dirname(id);
              const file = path.resolve(dirname, source.value);
              const content = readFileSync(file).toString();
              const minified = minify(content, htmlMinifierOptions);
              const html = `process.env.NODE_ENV === 'production' \n? \`${minified}\` \n: \`${content}\n\``;

              specifier = specifier ? specifier.local.name : ('icon' + totalUnnamedSpecifiers++);
              let addedCode = `${templateClassImport}\n var ${specifier} = new HTMLTemplate(${html});\n`;

              if (isSVG) {
                addedCode += iconStoreImport;
                const fileName = path.basename(file);
                addedCode += `IconStore.set('${fileName.slice(0, -4)}', ${specifier})`;
                iconStoreImport = '';
              }

              _code = _code.slice(0, start + shift) + addedCode + _code.slice(end + shift);
              shift = _code.length - code.length;
              templateClassImport = '';
            }
          }
				},
			});

      return {
        code: _code
      };
    }

	};
}