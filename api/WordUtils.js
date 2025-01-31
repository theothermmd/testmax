import Fuse from "fuse.js";

class WordUtils {
    constructor(wordList) {
        this.wordList = wordList;

        this.translationMap = {
            "ي": "ی",
            "ك": "ک",
            "ە": "ه",
            "إ": "ا",
            "ؤ": "و",
            "ء": "",
            "ة": "ه",
            "٫": ".",
            "٬": ","
        };

        // تنظیم Fuse.js
        this.fuse = new Fuse(this.wordList, {
            threshold: 0.5, // مقدار بالاتر برای انعطاف‌پذیری بیشتر
            includeScore: true
        });
    }

    correctPersianText(text) {
        return text.split("").map(char => this.translationMap[char] || char).join("");
    }

    findClosestWord(inputWord, scoreThreshold = 0.5) {
        const results = this.fuse.search(inputWord);
        
        if (results.length > 0 && results[0].score < scoreThreshold) {
            return results[0].item;
        }
        return null;
    }
}

export default WordUtils;
