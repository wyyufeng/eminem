import { useEffect } from 'react';
function App() {
    const [placeholder, setplaceholder] = useState({
        author: '',
        sentence: '',
        name: ''
    });

    useEffect(async () => {
        const res = await fetch('https://open.saintic.com/api/sentence/');
        const json = await res.json();
        const { author, sentence, name } = json.data;
    }, []);
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
