export type DevFormat = 'json-csv' | 'csv-json' | 'xml-json' | 'base64';

export const transformData = async (file: File, format: DevFormat): Promise<string> => {
    const text = await file.text();
    let result = '';
    let mimeType = 'text/plain';

    try {
        if (format === 'json-csv') {
            const data = JSON.parse(text);
            if (!Array.isArray(data)) throw new Error("JSON must be an array of objects for CSV conversion.");
            if (data.length === 0) return "";
            const headers = Object.keys(data[0]);
            const rows = data.map((obj: any) => headers.map(header => obj[header]).join(','));
            result = [headers.join(','), ...rows].join('\n');
            mimeType = 'text/csv';
        } else if (format === 'csv-json') {
            const lines = text.trim().split('\n');
            if (lines.length === 0) return "[]";
            const headers = lines[0].split(',');
            const data = lines.slice(1).map(line => {
                const values = line.split(',');
                return headers.reduce((obj: any, header, i) => {
                    obj[header.trim()] = values[i]?.trim() || '';
                    return obj;
                }, {});
            });
            result = JSON.stringify(data, null, 2);
            mimeType = 'application/json';
        } else if (format === 'base64') {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result as string);
                reader.onerror = reject;
                reader.readAsDataURL(file);
            });
        } else if (format === 'xml-json') {
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(text, "text/xml");

            const parseNode = (node: Node): any => {
                if (node.nodeType === 3) return node.nodeValue;

                const obj: any = {};
                if (node.nodeType === 1) {
                    const el = node as Element;
                    if (el.attributes && el.attributes.length > 0) {
                        obj["@attributes"] = {};
                        for (let i = 0; i < el.attributes.length; i++) {
                            const attr = el.attributes.item(i);
                            if (attr) obj["@attributes"][attr.nodeName] = attr.nodeValue;
                        }
                    }
                }

                if (node.hasChildNodes()) {
                    for (let i = 0; i < node.childNodes.length; i++) {
                        const item = node.childNodes.item(i);
                        const nodeName = item.nodeName;
                        if (nodeName === "#text" && node.childNodes.length === 1) return item.nodeValue;

                        const value = parseNode(item);
                        if (obj[nodeName] === undefined) {
                            obj[nodeName] = value;
                        } else {
                            if (!Array.isArray(obj[nodeName])) {
                                obj[nodeName] = [obj[nodeName]];
                            }
                            obj[nodeName].push(value);
                        }
                    }
                }
                return obj;
            };

            result = JSON.stringify(parseNode(xmlDoc), null, 2);
            mimeType = 'application/json';
        }

        const blob = new Blob([result], { type: mimeType });
        return URL.createObjectURL(blob);
    } catch (err: any) {
        throw new Error(`Data Transform Error: ${err.message}`);
    }
};
