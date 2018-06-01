export as namespace SelectBox;

export function newInput(container: HTMLElement, callBack: function(string): Promise<Array<string>>, template?: HTMLInputElement, tokenBox?: boolean, readonly?: boolean, onSelect?: function(string, false): void, itemIDCode?: string, itemNameCodes?: Array<string>, tableColumns?: Array<string>): HTMLInputElement;