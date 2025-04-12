import Fuse from "fuse.js";

class WordUtils {
    constructor(wordList) {
        this.wordList = wordList;

        this.translationMap = {
			
				'ي': 'ی',
				'ك': 'ک',
				'ە': 'ه',
				'إ': 'ا',
				'ؤ': 'و',
				'ء': '',
				'ة': 'ه',
				'٫': '.',
				'٬': ',',
				'ّ': '',
				'\u200c': ' '
			
        };


        this.fuse = new Fuse(this.wordList, {
            threshold: 0.7, 
            includeScore: true,
            tokenize: true,
            ignoreLocation: true, // نادیده گرفتن موقعیت مطابقت در رشته
            // در صورت نیاز می‌توانید findAllMatches: true را نیز اضافه کنید:
            // findAllMatches: true
        });
    }

    correctPersianText(text) {
        
        return text.split("").map(char => this.translationMap[char] || char).join("");
    }

    findClosestWord(inputWord, scoreThreshold = 0.7) {
        // ابتدا ورودی را تصحیح می‌کنیم
        const correctedInput = this.correctPersianText(inputWord);
        const results = this.fuse.search(correctedInput);
        
        if (results.length > 0 && results[0].score < scoreThreshold) {
            return results[0].item;
        }
        return null;
    }
}

export default WordUtils;
