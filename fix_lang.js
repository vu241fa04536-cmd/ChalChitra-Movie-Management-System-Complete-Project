const fs = require('fs');
let code = fs.readFileSync('js/utils.js', 'utf8');

const newTranslations = `const translations = {
    en: {
        menu: "Menu", movies: "Movies", trailers: "Trailers", webseries: "Webseries",
        signin: "Sign in", upNext: "Up Next", browseTrailer: "Browse Trailer >",
        myWatchlist: "My Watchlist", favMovies: "Favourite Movies",
        upcomingMovies: "Upcoming Movies", filters: "Filters", genre: "Genre:",
        language: "Language:", sort: "Sort", rating: "Rating:", exploreMovies: "Explore Movies",
        shortMovies: "Short Movies", cartoons: "Cartoons", yourInterest: "Your Interest:",
        search: "Search:"
    },
    hi: {
        menu: "मेनू", movies: "फिल्में", trailers: "ट्रेलर", webseries: "वेब सीरीज",
        signin: "साइन इन", upNext: "अगला", browseTrailer: "ट्रेलर ब्राउज़ करें >",
        myWatchlist: "मेरी वॉचलिस्ट", favMovies: "पसंदीदा फिल्में",
        upcomingMovies: "आने वाली फिल्में", filters: "फिल्टर", genre: "शैली:",
        language: "भाषा:", sort: "क्रमबद्ध करें", rating: "रेटिंग:", exploreMovies: "फिल्में खोजें",
        shortMovies: "लघु फिल्में", cartoons: "कार्टून", yourInterest: "आपकी रुचि:",
        search: "खोजें:"
    },
    te: {
        menu: "మెనూ", movies: "సినిమాలు", trailers: "ట్రైలర్స్", webseries: "వెబ్ సిరీస్",
        signin: "సైన్ ఇన్", upNext: "తర్వాత", browseTrailer: "ట్రైలర్ బ్రౌజ్ చేయండి >",
        myWatchlist: "నా వాచ్‌లిస్ట్", favMovies: "ఇష్టమైన సినిమాలు",
        upcomingMovies: "రాబోయే సినిమాలు", filters: "ఫిల్టర్లు", genre: "శైలి:",
        language: "భాష:", sort: "క్రమబద్ధీకరించు", rating: "రేటింగ్:", exploreMovies: "సినిమాలను అన్వేషించండి",
        shortMovies: "లఘు చిత్రాలు", cartoons: "కార్టూన్లు", yourInterest: "మీ ఆసక్తి:",
        search: "వెతుకు:"
    }
};`;

code = code.replace(/const translations = \{[\s\S]*?\n\};\n/, newTranslations + '\n\n');
fs.writeFileSync('js/utils.js', code, 'utf8');

