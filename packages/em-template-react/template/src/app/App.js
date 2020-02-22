import React, { useEffect, useState } from 'react';
function App() {
    const [placeholder, setplaceholder] = useState({
        author: '',
        sentence: '',
        name: ''
    });

    useEffect(() => {
        const fetchData = async () => {
            const res = await fetch('https://open.saintic.com/api/sentence/');
            const json = await res.json();
            const { author, sentence, name } = json.data;
            setplaceholder({
                author,
                sentence,
                name
            });
        };
        fetchData();
    }, []);
    const { sentence, author, name } = placeholder;
    return (
        <div className="container">
            <p>{sentence}</p>
            <span>
                ——{author}，《{name}》
            </span>
        </div>
    );
}

export default App;
