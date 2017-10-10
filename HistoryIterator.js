function HistoryIterator() {
    this.currentIndex = -1;
    this.history = [];

    this.current = function () {
        if (this.history.length > 0)
            return this.history[this.currentIndex];
        return null;
    };

    this.hasNext = function () {
        return this.history.length > this.currentIndex + 1;
    };

    this.hasPrev = function () {
        return this.currentIndex > 0;
    };

    this.pushNew = function (directory) {
        var count = this.history.length - (this.currentIndex + 1);
        if (count > 0) {
            this.history.splice(this.currentIndex + 1, count);
        }
        this.history.push(directory);
        this.currentIndex++;
        return this.current();
    };

    this.forward = function () {
        if (this.hasNext())
            return this.history[++this.currentIndex];
        return null;
    };

    this.back = function () {
        if (this.hasPrev())
            return this.history[--this.currentIndex];
        return null;
    };

    this.remove = function (dir) {
        let current = this.current();
        for (let i = 0; i < this.history.length; i++) {
            if (this.history[i] === dir) {
                this.history.splice(i, 1);
                i--;
                this.currentIndex = this.history.lastIndexOf(current);
            }
            else {
                let parent = this.history[i].parent;
                while(parent !== null)
                {
                    if(parent === dir){
                        this.history.splice(i, 1);
                        i--;
                        this.currentIndex = this.history.lastIndexOf(current);
                    }
                    parent = parent.parent;
                }
            }
        }
    };
}

