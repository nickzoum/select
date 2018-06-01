SelectBox.newInput(document.getElementById("list"), searchUser, null, true, true, null, "Id", ["toString"]);
function searchUser() {
    return {
        then: function (resolve) {
            resolve([{
                Id: 1,
                toString: function () { return "First Object"; }
            }, {
                Id: 2,
                toString: function () { return "Second Object"; }
            }, {
                Id: 3,
                toString: function () { return "Third Object"; }
            }, {
                Id: 4,
                toString: function () { return "Fourth Object"; }
            }, {
                Id: 5,
                toString: function () { return "Fifth Object"; }
            }, {
                Id: 6,
                toString: function () { return "Sixth Object"; }
            }, {
                Id: 7,
                toString: function () { return "Seventh Object"; }
            }, {
                Id: 8,
                toString: function () { return "Eight Object"; }
            }, {
                Id: 9,
                toString: function () { return "Ninth Object"; }
            }, {
                Id: 10,
                toString: function () { return "Tenth Object"; }
            }, {
                Id: 11,
                toString: function () { return "Eleventh Object"; }
            }, {
                Id: 12,
                toString: function () { return "Twelveth Object"; }
            }, {
                Id: 13,
                toString: function () { return "Thirtheen Object"; }
            }]);
        }
    };
}