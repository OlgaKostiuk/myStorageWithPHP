function ContextMenu() {
    var coordinates = {
        x: 0,
        y: 0
    };

    var contextMenu;
    var caller;

    $(document).mousemove(function (e) {
        coordinates.x = e.pageX;
        coordinates.y = e.pageY;
    });

    this.destroyContextMenu = function () {
        if (contextMenu !== undefined) {
            contextMenu.remove();
            contextMenu = undefined;
        }
    };

    this.renderContextMenu = function (options, callerElement) {
        if(caller !== undefined){
            caller.removeClass("active");
        }
        let self = this;
        if (contextMenu === undefined) {
            contextMenu = $("<div>", {id: 'contextMenu', class: "list-group"});
            let length = options.length;
            for (let i = 0; i < length; i++) {
                let item = ($("<a>", {href: "#", text: options[i].name, class: "list-group-item"}));
                item.appendTo(contextMenu);
                item.click(options[i].handler);
                item.click(self.destroyContextMenu);
            }
            contextMenu.css({
                position: "absolute",
                "z-index": 10000,
                display: "block",
                left: coordinates.x,
                top: coordinates.y
            });
            caller = callerElement;
            caller.addClass("active");
            contextMenu.appendTo('body');
            $(document).click(function() {
                caller.removeClass("active");
                self.destroyContextMenu();
            });
        }
        else {
            self.destroyContextMenu();
            self.renderContextMenu(options, callerElement);
        }
    }
}