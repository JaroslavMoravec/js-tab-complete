;(function (_undefined) {

    function Trie (prefix) {
        // Prefix records our position in the larger trie datastructure
        this.prefix = _.isUndefined(prefix) ? '' : prefix;

        // Keys are the first characters of the children and values
        // are the sub-Tries
        this.children = {}

        // If a word has been added that ends at this trie, is true.
        this.isEnd = false;
    }

    /*
     * Add a list of words to the trie.
     */
    Trie.prototype.words = function (words) {
        _.each(words, function (w) { this.word(w); }, this);
        return this;
    }

    /*
     * Add a single word to the trie.
     */
    Trie.prototype.word = function (word) {

        var c = word.charAt(0);
        if (!(c in this.children)) {
            this.children[c] = new Trie(this.prefix + c);
        }
        if (word.length > 1) {
            this.children[c].word(word.substring(1));
        } else {
            this.children[c].isEnd = true;
        }
        return this;
    };

    /*
     * Starting from the current node, navigate to the node reachable,
     * if any, with the given prefix.
     */
    Trie.prototype.find = function (prefix) {
        if (prefix.length == 0) {
            return this;
        } else {
            var c = prefix[0];
            if (c in this.children) {
                return this.children[c].find(prefix.substring(1));
            } else {
                return null;
            }
        }
    }

    /*
     * Starting from the current node, find the longest unique prefix.
     */
    Trie.prototype.uniquePrefix = function () {

        var nextCharacters = _.keys(this.children);

        if (this.isEnd || nextCharacters.length > 1) {
            // If this is the end, either we have children with differ
            // from us but who share our prefix or we do not in which
            // case this is the end of the line and our prefix is as
            // long as it gets.
            return this.prefix;

        } else if (nextCharacters.length === 1) {
            // If are not the end and we have only one child, we can
            // extend the prefix.
            return this.children[nextCharacters[0]].uniquePrefix();

        } else {
            // Special case that can only happen in an empty root node.
            return '';
        }
    }


    /*
     * Starting from the current node get a list of all the complete words beneath it.
     */
    Trie.prototype.choices = function () {
        var result = [];
        function walk (trie) {
            // This node may itself represent a full word.
            if (trie.isEnd) result.push(trie.prefix);

            // And it may have chidlern representing longer words.
            _.each(trie.children, function (child, c) {
                walk(child);
            });
        }

        walk(this);
        return result;
    }

    $(document).ready(function () {

        $('#suggestions').empty().hide();

        var words = ['abcfoo', 'abcfoobar', 'abcbar', 'abcfood', 'abcbaz', 'abcbarth', 'abcquux', 'abc'];

        var root = new Trie().words(words);

        $('#to_complete')
            .keydown(function (e) {
                if (e.which === 9) {
                    $('#suggestions').empty().hide();
                    var trie = root.find(e.target.value);
                    if (trie) {
                        e.target.value = trie.uniquePrefix();
                        var choices = trie.choices();
                        if (choices.length > 0) {
                            $('#suggestions').toggle();
                            _.each(choices, function (w) { $('#suggestions').append($('<p>').text(w)); });
                        }
                    }
                    e.preventDefault();
                } else if (e.which === 13) {
                    $('#log').append($('<p>').text('change: ' + e.target.value));
                    $('#suggestions').empty().hide();
                    e.preventDefault();
                }
            })
            .blur(function (e) {
                $('#log').append($('<p>').text('blur: ' + e.target.value));
            });

    });
}());
