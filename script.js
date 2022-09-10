const baseAPI = 'https://jservice.io/api/'
const numOfCats = 6;
const cluesPerCat = 5
let categories = [];

async function getCategoryIds() {
    const res = await axios.get(`${baseAPI}categories?count=100`);
    const clues = res.data.filter(object => {
        return object.clues_count > 4;
    });
    const catIDs = clues.map(x => x.id); 
    return _.sampleSize(catIDs, numOfCats);
}

async function getCategory(catId) {
    const res = await axios.get(`${baseAPI}category?id=${catId}`);
    const randomQA = _.sampleSize(res.data.clues, cluesPerCat);
    const clues = randomQA.map(randomQA => ({
        question: randomQA.question,
        answer: randomQA.answer,
        showing: null
    }));
    return {
        title: res.data.title,
        clues: clues
    };
}

async function fillTable() {
    let $tr = $("<tr>")
    for (let i = 0; i < numOfCats; i++) {
        let $th = $("<th>")
        $tr.append($th.text(categories[i].title));
    }
    $('#board-head').append($tr);
    for (let j = 0; j < cluesPerCat; j++) {
        let $tr = $("<tr>")
        for (let k = 0; k < numOfCats; k++) {
            let $td = $("<td>")
            $tr.append($td.attr('id', `${k}-${j}`).text('?'))
        }
        $('#board-body').append($tr)
    }
}

function handleClick(evt) {
    let targetID = evt.target.id
    let catID = targetID.split("-")[0];
    let clueID = targetID.split("-")[1];
    let clue = categories[catID].clues[clueID]

    if (clue.showing === null) {
        evt.target.innerText = clue.question;
        clue.showing = 'question';
        evt.target.classList.toggle('question');
    } else if (clue.showing == 'question') {
        evt.target.classList.toggle('question');        
        evt.target.innerText = clue.answer;
        clue.showing = 'answer';
        evt.target.classList.toggle('answer');
    } else {
        return;
    }
}

function showLoadingView() {
    $('#loader').show();
    setupAndStart();
}

function hideLoadingView() {
    $('#loader').hide();
}

async function setupAndStart() {
    categories = [];
    let IDs = await getCategoryIds();
    for (id of IDs) {
        categories.push(await getCategory(id))
    }
    await fillTable();
    await hideLoadingView();

}

$('#restart-btn').on('click', function() {
    $("#board-head tr").remove();
    $("#board-body tr").remove();
    showLoadingView()
})

$('#start-btn').on('click', function() {
    showLoadingView()
    $('#container').show();
    $('#restart-btn').show();
    $('#start-btn').hide();

})

$(window).on('load', function() {
    $('#loader').hide();
    $('#start-menu').show();
    $("#board-body").on('click', 'td', function(evt) {
        handleClick(evt);
    })
})

