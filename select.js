var SelectBox = (function () {
  var SelectModel = {
    init: init,
    onContainerClicked: onContainerClicked,
    onClearClicked: onClearClicked,
    onItemChanged: onItemChanged,
    onItemClicked: onItemClicked,
    containsId: containsId,
    onKeyDown: onKeyDown,
    onKeyUp: onKeyUp,
    onLoad: onLoad
  };

  /**
   * Creates a new Select Box Control
   * @param {HTMLElement} container - The Container Element
   * @param {function(string): Promise<Array<string>>} callBack - The function to be called the input changes
   * @param {HTMLInputElement} template - HTMLInputElement to use as a template
   * @param {boolean} tokenBox - If true it returns a tokenbox isntead
   * @param {boolean} [readonly=] - if true user cannot write in the input box
   * @param {function(HTMLInputElement, string): void} onSelect - function to be called when a new item is selected
   * @param {string} [itemIDCode=] - the name of the key indicating the id
   * @param {string} [itemNameCodes=] - the name of the key indicating the description, if more than one then the dropdown will be displayed in table form
   * @param {Array<string>} [tableColumns=] - the title of each column (assuming there is more than one item name code)
   * @returns {HTMLInputElement} - The newly created input element
   */
  function init(container, callBack, template, tokenBox, readonly, onSelect, itemIDCode, itemNameCodes, tableColumns) {
    this.container = EasyHtml.clearDom(container);
    this.container.className = "drop-down-parent";
    this.itemNameCodes = itemNameCodes;
    this.tableColumns = tableColumns;
    this.itemIDCode = itemIDCode;
    this.firstValid = undefined;
    this.callBack = callBack;
    this.tokenBox = tokenBox;
    this.onSelect = onSelect;
    this.domList = [];
    var self = this;
    this.input = EasyHtml.newInput(undefined, undefined, "true", undefined, "text");
    if (readonly) this.input.setAttribute("readonly", "true");
    this.container.addEventListener("click", onContainerClicked);
    this.input.addEventListener("keydown", onKeyDown);
    this.input.addEventListener("keyup", onKeyUp);
    this.ul = EasyHtml.newList("drop-down-list");
    this.container.appendChild(this.input);
    if (this.itemNameCodes.length > 1) {
      var columns = EasyHtml.newDiv("column-title");
      var columnNames = EasyHtml.newList("table-list");
      for (var columnIndex = 0; columnIndex < this.itemNameCodes.length; columnIndex++) {
        columnNames.appendChild(EasyHtml.newListItem(null, this.tableColumns[columnIndex]));
      }
      columns.appendChild(columnNames);
      this.container.appendChild(columns);
    }
    this.container.appendChild(this.ul);
    for (var index = 0; index < template.attributes.length; index++) {
      var attribute = template.attributes[index];
      this.input.setAttribute(attribute.name, template.value);
    }
    if (this.tokenBox === true) {
      this.container.classList.add("token-box");
      this.container.addEventListener("click", function (event) {
        if (event.srcElement === self.container) {
          self.input.focus();
        }
      });
      this.input.addEventListener("keydown", function (event) {
        var previous = self.input.previousElementSibling;
        if (previous && event.keyCode === 8 && self.input.value.length === 0) {
          previous.parentElement.removeChild(previous);
        }
      });
    } else {
      var button = EasyHtml.newButton("clear");
      button.addEventListener("click", onClearClicked);
      this.container.appendChild(button);
    }

    function onContainerClicked(event) {
      self.onContainerClicked.call(self, event);
    }

    function onClearClicked(event) {
      self.onClearClicked.call(self, event);
    }

    function onKeyDown(event) {
      self.onKeyDown.call(self, event);
    }

    function onKeyUp(event) {
      self.onKeyUp.call(self, event);
    }
    return this.input;
  }

  /**
   * Is called when the item is changed
   * @param {string} text
   * @param {string} id
   * @returns {void}
   */
  function onItemChanged(text, id) {
    var self = this;
    if (this.tokenBox === true) {
      var box = EasyHtml.newDiv("token-item", text);
      var clear = EasyHtml.newButton("clear");
      clear.addEventListener("click", deleteBox);
      this.input.removeAttribute("item-id");
      box.setAttribute("item-id", id);
      this.input.value = null;
      this.input.focus();
      EasyHtml.addChildWithOrder(this.container, box, undefined, this.input);
      box.appendChild(clear);

      function deleteBox(event) {
        if (self.container.contains(box)) {
          self.container.removeChild(box);
        }
        self.input.focus();
        event.preventDefault();
      }
    } else {
      this.input.setAttribute("item-id", id);
      this.input.value = text;
    }
    this.onSelect(this.input, this.input.getAttribute("item-id"));
    this.firstValid = undefined;
  }

  /**
   * On Click event of each item
   * @param {MouseEvent} event - Mouse Event
   * @returns {void}
   */
  function onItemClicked(event) {
    var target = event.srcElement;
    if (this.input.getAttribute("item-id") !== target.getAttribute("item-id")) {
      this.onItemChanged(target.querySelector("li").textContent, target.getAttribute("item-id"));
    }
    this.container.classList.remove("open");
    event.preventDefault();
  }

  /**
   * On Key pressed event, used to detect tab and enter
   * @param {KeyboardEvent} event - KeyBoard Event
   * @returns {void}
   */
  function onKeyDown(event) {
    var code = event.keyCode;
    var self = this;
    if (code === 13) {
      if (this.firstValid !== null && this.firstValid !== undefined) {
        if (this.input.getAttribute("item-id") !== this.firstValid.getAttribute("item-id")) {
          this.input.setAttribute("item-id", this.firstValid.getAttribute("item-id"));
          var result = this.firstValid.querySelector("li").textContent;
          this.input.value = result;
          this.onItemChanged(result, this.firstValid.getAttribute("item-id"));
        }
      }
      this.container.classList.remove("open");
      event.preventDefault();
    } else if (code === 38) {
      if (this.firstValid !== undefined && this.firstValid !== null) {
        var previous = this.firstValid.previousElementSibling;
        if (previous !== null) {
          this.firstValid.classList.remove("active");
          this.ul.scrollTop = previous.offsetTop - 10;
          previous.classList.add("active");
          this.firstValid = previous;
        }
      } else {
        this.callBack(this.input.value).then(onLoad);
      }
    } else if (code === 40) {
      if (this.firstValid !== undefined && this.firstValid !== null) {
        var next = this.firstValid.nextElementSibling;
        if (next !== null) {
          this.firstValid.classList.remove("active");
          this.ul.scrollTop = next.offsetTop - 10;
          next.classList.add("active");
          this.firstValid = next;
        }
      } else {
        this.callBack(this.input.value).then(onLoad);
      }
    } else if (code === 27) {
      this.container.classList.remove("open");
      this.input.removeAttribute("item-id");
      this.ul.innerHTML = "";
    } else {
      this.container.classList.remove("open");
      this.input.removeAttribute("item-id");
      this.ul.innerHTML = "";
    }

    function onLoad(result) {
      self.onLoad.call(self, result);
    }
  }

  /**
   * On key released event
   * @param {KeyboardEvent} event - KeyBoard Event
   * @returns {void}
   */
  function onKeyUp(event) {
    var code = event.keyCode;
    var self = this;
    if (code === 13) {
      this.container.classList.remove("open");
    } else if (code === 27) {
      this.container.classList.remove("open");
      this.input.removeAttribute("item-id");
      this.ul.innerHTML = "";
    } else if (code !== 38 && code !== 40) {
      this.callBack(this.input.value).then(onLoad);
    }

    function onLoad(result) {
      self.onLoad.call(self, result);
    }
  }

  /**
   * Function to be called when the callBack is ready
   * @param {string|Array<object>} result - The returned result in string or list form
   * @returns {void}
   */
  function onLoad(result) {
    var flag = false;
    var self = this;
    var list = Functions.cast([""], []);
    var ul = EasyHtml.clearDom(this.ul);
    if (typeof result === "string") list = JSON.parse(result);
    else if (result instanceof Array) list = result;
    else list = [];
    this.firstValid = undefined;
    for (var index = 0; index < list.length; index++) {
      var text = list[index];
      var li = EasyHtml.newListItem();
      if (typeof text === "string") {
        li.setAttribute("item-id", text);
        li.textContent = text;
      } else if (typeof text === "object" && text !== null) {
        var tableList = EasyHtml.newList("table-list");
        for (var tableIndex = 0; tableIndex < this.itemNameCodes.length; tableIndex++) {
          nameResult = text[this.itemNameCodes[tableIndex]];
          if (typeof nameResult === "function") nameResult = nameResult();
          tableList.appendChild(EasyHtml.newListItem(null, nameResult));
        }
        li.appendChild(tableList);
        nameResult = Functions.getFirstProperty(text, [this.itemIDCode, "Id", "Code", "id", "code", "ID"])
        if (typeof nameResult === "function") nameResult = nameResult();
        li.setAttribute("item-id", nameResult);
      } else {
        li = null;
      }
      if (li !== null && !this.containsId(li.getAttribute("item-id"))) {
        li.addEventListener("click", onItemClicked);
        if (!flag) this.firstValid = li;
        ul.appendChild(li);
        flag = true;
      }
    }
    if (this.firstValid !== undefined) {
      this.firstValid.className = "active";
      this.container.classList.add("open");
      ul.scrollTop = 0;
    } else {
      this.container.classList.remove("open");
    }

    function onItemClicked(event) {
      self.onItemClicked.call(self, event);
    }
  }

  /**
   * Event to be fired when the general area of the Control is clicked,
   * to show or hide the list on click
   * @param {MouseEvent} event - Mouse Event
   * @returns {void}
   */
  function onContainerClicked(event) {
    var target = event.target,
      self = this;
    if (!event.defaultPrevented) {
      if (target === this.input || target === this.container) {
        if (!this.container.classList.contains("open")) {
          this.callBack(this.input.value).then(onLoad);
        }
      }
      event.preventDefault();
    }

    function onLoad(result) {
      self.onLoad.call(self, result);
    }
  }

  /**
   * Creates a new Select Box Control
   * @param {HTMLElement} container - The Container Element
   * @param {function(string): Promise<Array<string>>} callBack - The function to be called the input changes
   * @param {string} [template=] - An optional input element to copy
   * @param {boolean} [tokenBox=] - Optional parameter, if true, select-box will turn into a token-box
   * @param {boolean} [readonly=] - if true user cannot write in the input box
   * @param {function(HTMLInputElement, string): void} [onSelect=] - Optional function to be executed when a new item is selected
   * @param {string} [itemIDCode=] - the name of the key indicating the id
   * @param {Array<string>} [itemNameCodes=] - the name of the key indicating the description, if more than one then the dropdown will be displayed in table form
   * @param {Array<string>} [tableColumns=] - the title of each column (assuming there is more than one item name code)
   * @returns {HTMLInputElement} - The created input element
   */
  function newInput(container, callBack, template, tokenBox, readonly, onSelect, itemIDCode, itemNameCodes, tableColumns) {
    if (!(template instanceof HTMLInputElement))
      template = document.createElement("input");
    if (typeof onSelect !== "function") onSelect = function () { };
    if (tokenBox !== true) tokenBox = false;
    if (readonly !== true) readonly = false;
    if (!(itemNameCodes instanceof Array)) itemNameCodes = [];
    if (itemNameCodes.length < 1) itemNameCodes[0] = "Name";
    if (!(tableColumns instanceof Array)) tableColumns = [];
    if (itemNameCodes.length !== 1) {
      while (tableColumns.length < itemNameCodes.length) {
        tableColumns[tableColumns.length] = itemNameCodes[tableColumns.length];
      }
    }
    var model = Functions.createObject(SelectModel);
    return model.init(container, callBack, template, tokenBox, readonly, onSelect, itemIDCode, itemNameCodes, tableColumns);
  }

  /**
   * The on clear button event
   * @param {MouseEvent} event - The Mouse Event
   * @returns {void}
   */
  function onClearClicked(event) {
    this.container.classList.remove("open");
    this.input.removeAttribute("item-id");
    event.preventDefault();
    this.input.value = "";
  }

  /**
   * Checks if an item with that id already exists in selected list
   * @param {string} itemId 
   * @returns {boolean}
   */
  function containsId(itemId) {
    var list = this.container.children;
    for (var index = 0; index < list.length; index++) {
      if (list[index].getAttribute("item-id") == itemId) return true;
    }
    return false;
  }

  var EasyHtml = (function EasyHtmlIIFE() {
    /**
     * @param {HTMLElement} dom
     * @returns {HTMLElement}
     */
    function clearDom(dom) {
      if (dom !== null && typeof dom === "object") {
        if (dom.constructor === HTMLInputElement) dom.value = "";
        else dom.innerHTML = "";
      }
      return dom;
    }

    /**
     * @param {string} [className=]
     * @param {string} [value=]
     * @param {string} [required=]
     * @param {string} [placeholder=]
     * @param {string} [type=]
     * @param {number} [maxLength=]
     * @param {string} [pattern=]
     * @param {string} [title=]
     * @returns {HTMLInputElement}
     */
    function newInput(className, value, required, placeholder, type, maxLength, pattern, title) {
      var input = document.createElement("input");
      if (placeholder) input.placeholder = placeholder;
      if (className) input.className = className;
      if (maxLength) input.maxLength = maxLength;
      if (required) input.required = required;
      if (pattern) input.pattern = pattern;
      if (title) input.title = title;
      if (type) input.type = type;
      if (value) input.value = value;
      return input;
    }

    /**
     * @param {string} [className=]
     * @returns {HTMLUListElement}
     */
    function newList(className) {
      var list = document.createElement("ul");
      if (className) list.className = className;
      return list;
    }

    /**
     * @param {string} [className=]
     * @param {string} [text=]
     * @returns {HTMLButtonElement}
     */
    function newButton(className, text) {
      var button = document.createElement("button");
      if (className) button.className = className;
      if (text) button.innerHTML = text;
      return button;
    }

    /**
     * @param {string} [className=]
     * @param {string} [text=]
     * @returns {HTMLDivElement}
     */
    function newDiv(className, text) {
      var div = document.createElement("div");
      if (className) div.className = className;
      if (text) div.innerHTML = text;
      return div;
    }

    /**
     * Adds a new element in a parent dom in alphabetic order
     * @param {HTMLElement} parentElement - parent element
     * @param {HTMLElement} newChild - element to be added
     * @param {HTMLElement} [start=] - element needs to be added after this element
     * @param {HTMLElement} [end=] - element needs to be added before this element
     * @returns {HTMLElement} - the newlly added element
     */
    function addChildWithOrder(parentElement, newChild, start, end) {
      var firstChild = isValidHTML(start) ? start : parentElement.firstElementChild;
      while (firstChild !== null && firstChild !== end && firstChild.textContent <= newChild.textContent) {
        firstChild = firstChild.nextElementSibling;
      }
      if (isValidHTML(firstChild)) parentElement.insertBefore(newChild, firstChild);
      else parentElement.appendChild(newChild);
      return newChild;
    }

    /**
     * Checks whether the input is a valid htmlelement
     * @param {HTMLElement} input - an html element
     * @returns {boolean} - whether it is a valid htmlelement
     */
    function isValidHTML(input) {
      return input instanceof HTMLElement;
    }

    /**
     * @param {string} [className=]
     * @param {string} [text=]
     * @returns {HTMLLIElement}
     */
    function newListItem(className, text) {
      var item = document.createElement("li");
      if (className) item.className = className;
      if (text) item.innerHTML = text;
      return item;
    }

    return {
      clearDom: clearDom,
      newInput: newInput,
      newList: newList,
      newButton: newButton,
      newDiv: newDiv,
      addChildWithOrder: addChildWithOrder,
      newListItem: newListItem
    };
  })();

  var Functions = (function FunctionsIIFE() {
    /**
     * Creates a new instance of a function or prototype object
     * @param {T} prototype - prototype object or function
     * @template T
     * @returns {T}
     */
    function createObject(prototype) {
      if ("function" === typeof prototype) return Object.create(new prototype());
      else if ("object" === typeof prototype) return Object.create(prototype);
      else return null;
    }
    /**
     * Casts a value as a prototype object
     * @param {T} prototype - prototype object
     * @param {*} value - random value to be casted
     * @template T
     * @returns {T} - original value casted as prototype
     */
    function cast(prototype, value) {
      return value;
    }
    /**
     * Returns the value of the first property that exists in both the object and the list
     * @param {{}} json - object
     * @param {Array<string>} properties - property list
     * @returns {string | number}
     */
    function getFirstProperty(json, properties) {
      for (var index = 0; index < properties.length; index++) {
        var property = properties[index];
        if (json.hasOwnProperty(property)) {
          var value = json[property];
          if (typeof value === "string" || typeof value === "number" || typeof value === "function") {
            return value;
          }
        }
      }
      return undefined;
    }
    return {
      getFirstProperty: getFirstProperty,
      createObject: createObject,
      cast: cast
    };
  })();

  /**
   * 
   * @param {MouseEvent} event
   * @returns {void} 
   */
  function closeAllLists(event) {
    var dropDownLists = document.querySelectorAll(".drop-down-parent");
    for (var index = 0; index < dropDownLists.length; index++) {
      var listItem = dropDownLists[index];
      if (!listItem.contains(event.target) && listItem !== event.target) {
        listItem.classList.remove("open");
      }
    }
  }

  function onPageLoad() {
    document.body.addEventListener("click", closeAllLists);
  }

  if (document.readyState === "complete") onPageLoad();
  else window.addEventListener("load", onPageLoad);

  return {
    newInput: newInput
  };
})();
