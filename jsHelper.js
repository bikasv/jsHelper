var jsHelper = (function () {
    "use strict";

    /*Public methods*/
    // DOM methods
    
    /**
     * Gets the text of a node without the text of it's child nodes
     * @param  {HTMLObject} elm The element for which text has to be extracted. This element can be native javascript element or jQuery element object
     * @return {String}     Text string of the node
     */
    var getNodeText = function(elm) {
        if(!elm) {
            return;
        } else if(elm instanceof Array) {
            elm = elm[0];
        }

        var firstText = "";
        for (var i = 0; i < elm.childNodes.length; i++) {
            var curNode = elm.childNodes[i];
            var whitespace = /^\s*$/;
            if (curNode.nodeName === "#text" && !(whitespace.test(curNode.nodeValue))) {
                firstText = curNode.nodeValue;
                break;
            }
        }
        return firstText;
    };

    /**
     * This returns whether the browser supports the given CSS property or not. It creates virtual element to test and thus doesn't affect the DOM.
     * @param  {String}  property CSS property to check
     * @return {Boolean}          Returns `true` if property is supported, `false` otherwise
     */
    var isCssPropertySupported = function(property) {
        var elm = document.createElement("div");
        var CSSProp = ("O Moz ms Webkit Khtml").split(" ");
        var capitalizedProperty = property.charAt(0).toUpperCase() + property.slice(1);
        var allProperties = (property + " " + CSSProp.join(capitalizedProperty + " ")).split(" ");
        var propertyLength = allProperties.length;

        for(var inc = 0; inc < propertyLength; inc++) {
            if(typeof elm.style[allProperties[inc]] !== "undefined") {
                return true;
            }
        }
        return false;
    };

    /**
     * This function checks whether the element supports the provided attribute. E.g. you can check if `plceholder` is supported by `input` or not.
     * @param  {HTMLObject/String}  element   Javascript or jQuery element or element name.
     * @param  {string}  attribute Name of the attribute to test
     * @return {Boolean}           Returns `true` if property is supported, `false` otherwise
     */
    var isAttributeSupported = function(element, attribute) {
        if(!element) {
            return false;
        } else if(element instanceof Array) {
            element = element[0];
        }

        var test = document.createElement(element);
        if (attribute in test) {
            return true;
        }else {
            return false;
        }
    };

    /**
     * This function creates placeholder for browsers that doesn't support placeholder. It won't affect the browsers which already supports `placeholder` property.
     * @param  {Object} options Options object where `textColor` and `placeholderColor` can be provided.
     * @param  {String} options.textColor Color of text which appears when user type in element
     * @param  {String} options.placeholderColor Color of placeholder
     */
    var createPlaceholder = function(options) {
        var opts = options || {};
        var textColor = opts || "#000";
        var placeholderColor = opts.placeholderColor || "grey";

        if(!this.isAttributeSupported("input", "placeholder")) {
            var inputs = document.getElementsByTagName("input");
            var textareas = document.getElementsByTagName("textarea");
            var elements = concat(inputs, textareas);
            var elementsLength = elements.length;

            for(var inc = 0; inc < elementsLength; inc++) {
                var inputElement = elements[inc];
                var value = inputElement.value;
                var placeholder = inputElement.getAttribute("placeholder");

                if(!(placeholder === "" || placeholder === null) && (value === "" || value === placeholder)) {
                    inputElement.value = placeholder;
                    inputElement.style.color = placeholderColor;
                }

                keyDownEvent(inputElement);
                onBlurEvent(inputElement);
            }
        }

        function keyDownEvent(elm) {
            elm.onkeydown = function() {
                var val = this.value;
                var defaultVal = this.getAttribute("placeholder");
                if(!(defaultVal === "" || defaultVal === null) && (val === "" || val === defaultVal)) {
                    this.value = "";
                    this.style.color = textColor;
                }
            };
        }

        function onBlurEvent(elm) {
            elm.onblur = function() {
                var val = this.value;
                var defaultVal = this.getAttribute("placeholder");
                if(!(defaultVal === "" || defaultVal === null) && (val === "" || val === defaultVal)) {
                    this.value = defaultVal;
                    this.style.color = placeholderColor;
                }
            };
        }
    };

    // Non-DOM methods
    
    /**
     * This function recursively merge two or more objects. The first object will be updated with merged results. If user wants new object, then he has to provide first object as empty object.
     * @param {Objects} objects Comma separated list of objects that needs to be merged. First object will be updated with merged result.
     * @return {Object} Merged object
     */
    var mergeObjects = function() {
        var length = arguments.length;
        if(length < 2) {
            return {
                error: "Provide at least two objects."
            };
        }

        for(var i = 0; i < length; i++) {
            if(!(arguments[i] instanceof Object)) {
                return {
                    error: "All arguments must be a Javascript Object."
                };
            }
        }

        var returnObject = arguments[0];
        for(var index = 1; index < length; index++) {
            mergeToRoot(returnObject, arguments[index]);
        }

        return returnObject;
    };

    /**
     * This function merges two or more arrays and returns back the resulting array.
     * @param {Array} arrays Comma separated arrays to be concatenated. All arguments must be an array or empty array will be returned
     * @return {Array} Concatenated array
     */
    var concat = function() {
        var returnArray = [];
        var nodesLength = arguments.length;

        if(nodeLength < 2) {
            return [];
        }

        for(var inc = 0; inc < nodesLength; inc++) {
            if(!(arguments[inc] instanceof Array)) {
                return [];
            }

            var nodeLength = arguments[inc].length;
            for(var i = 0; i < nodeLength; i++) {
                if(arguments[inc][i]) {
                    returnArray.push(arguments[inc][i]);
                }
            }
        }
        return returnArray;
    };

    /**
     * This function checks if two objects are same, i.e. if they contain same parameters with same values
     * @param  {Object}  objects Two objects to compare
     * @return {Boolean}         Returns true or false based on equality of objects
     */
    var isEqual = function() {
        var objects = arguments.length;

        if(objects < 2) {
            return false;
        } else if(!(objects[0] && typeof objects[0] === "object") || !(objects[1] && typeof objects[1] === "object")) {
            return false;
        }

        var firstProp = Object.getOwnPropertyNames(objects[0]);
        var secondProp = Object.getOwnPropertyNames(objects[1]);

        if (firstProp.length != secondProp.length) {
            return false;
        }

        for (var i = 0; i < firstProp.length; i++) {
            var propName = firstProp[i];
            if (objects[0][propName] !== objects[1][propName]) {
                return false;
            }
        }

        return true;
    };
    /*End Public methods*/

    /*Private methods*/
    function mergeToRoot(rootObject, objectToMerge) {
        for (var attribute in objectToMerge) {
            try {
                if(objectToMerge[attribute] instanceof Object) {
                    rootObject[attribute] = mergeToRoot(rootObject[attribute], objectToMerge[attribute]);
                } else {
                    rootObject[attribute] = objectToMerge[attribute];
                }
            } catch(e) {
                rootObject[attribute] = objectToMerge[attribute];
            }
        }
        return rootObject;
    }
    /*End Private methods*/

    return {
        getNodeText: getNodeText,
        isCssPropertySupported: isCssPropertySupported,
        isAttributeSupported: isAttributeSupported,
        mergeObjects: mergeObjects,
        concat: concat,
        createPlaceholder: createPlaceholder,
        isEqual: isEqual,
    };
} (jsHelper || {}));