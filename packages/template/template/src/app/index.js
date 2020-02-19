import './index.css';
async function render() {
    try {
        const res = await fetch('https://open.saintic.com/api/sentence/');
        const json = await res.json();
        const { author, sentence, name } = json.data;
        document.body.innerHTML = `<div class="container">
            <p>
            ${sentence}
            </p>
            <span>——${author}，《${name}》</span>
        </div>`;
    } catch (error) {
        console.log(error);
    }
}
render();
