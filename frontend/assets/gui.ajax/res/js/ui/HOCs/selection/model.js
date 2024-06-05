export default class SelectionModel {
    constructor(selection = [], currentIndex = 0) {
        this.selection = selection;
        this.currentIndex = currentIndex
    }

    length(){
        return this.selection.length;
    }

    hasNext(){
        return this.currentIndex < this.selection.length - 1;
    }

    hasPrevious(){
        return this.currentIndex > 0;
    }

    current(){
        return this.selection[this.currentIndex];
    }

    next(){
        if(this.hasNext()){
            this.currentIndex ++;
        }
        return this.current();
    }

    previous(){
        if(this.hasPrevious()){
            this.currentIndex --;
        }
        return this.current();
    }

    first(){
        return this.selection[0];
    }

    last(){
        return this.selection[this.selection.length -1];
    }

    nextOrFirst(){
        if(this.hasNext()) this.currentIndex ++;
        else this.currentIndex = 0;
        return this.current();
    }
}
