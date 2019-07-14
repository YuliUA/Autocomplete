const search = document.querySelector('#search');
const matchList = document.querySelector('#match');

class PrefixTreeNode {
    constructor(value) {
        this.children = {};
        this.endWord = null;
        this.value = value;
    }
}

class PrefixTree extends PrefixTreeNode {
    constructor() {
        super(null);
    }
    addWord(string) {
        const addWordHelper = (node, str) => {
            if (!node.children[str[0]]) {
                node.children[str[0]] = new PrefixTreeNode(str[0]);
                if (str.length === 1) {
                    node.children[str[0]].endWord = 1;
                }
            }
            if (str.length > 1) {
                addWordHelper(node.children[str[0]], str.slice(1));
            }
        };
        addWordHelper(this, string);
    }

    predictWord(string) {
        const getRemainingTree = function (string, tree) {
            let node = tree;
            while (string) {
                node = node.children[string[0]];
                string = string.substr(1);
            }
            return node;
        };

        let allWords = [];

        const allWordsHelper = function (stringSoFar, tree) {
            for (let k in tree.children) {
                const child = tree.children[k];
                let newString = stringSoFar + child.value;
                if (child.endWord) {
                    allWords.push(newString);
                }
                allWordsHelper(newString, child);
            }
        }

        const remainingTree = getRemainingTree(string, this);

        if (remainingTree === undefined) {
            allWords = [];
        } else {
            allWordsHelper(string, remainingTree);
            return allWords;
        }
        return allWords;
    }
};

const getData = async function getData(value) {
    //To predict data triggering
    if (value.length === 0) {
        matchList.innerHTML = '';
        return;
    }
    const res = await fetch('./data.json');
    const countriesJSON = await res.json();
    const countriesArr = await countriesJSON.map(country => country.name);
    // Becouse of JSON contries names starts from capital letter 
    //we need to create prefix-tree based on lowercase method to predict an error
    const fixedCountriesArr = [];
    countriesArr.forEach(i => { fixedCountriesArr.push(i.toLowerCase()) });

    //Create prefix-tree
    let arr = new PrefixTree;
    await fixedCountriesArr.map(country => arr.addWord(country));

    //Find all matched words
    let matches = arr.predictWord(value);

    //append all matches to DOM
    outputMatches(matches);
};

const outputMatches = matches => {
    if (matches.length === 0) {
        matchList.innerHTML = 'No matches...';
    } else {
        const html = matches.map(
            match => `
            <li class="list-unstyled col-12 results">${match.charAt(0).toUpperCase() + match.slice(1)}</li>
            `).join('');
        matchList.innerHTML = html;
    }
}

const highlightMAtches = value => {
    let count = value.length;
    let liArr = document.querySelectorAll('.results');
    liArr.forEach(li => {
        let str = li.innerText;
        li.innerHTML = `<b>${str.substr(0, count)}</b>` + `${str.slice(count)}`;
    })
}

//User handlers
search.addEventListener('input', (e) => getData(e.target.value.toLowerCase()));
search.addEventListener('keyup', (e) => highlightMAtches(e.target.value));