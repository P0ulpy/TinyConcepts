const Config = {
    interval: 500,
    textLenght: 2000
};

const DOM = {
    inputText: document.getElementById('input-text'),
    outputText: document.getElementById('output-text')
};

async function sender()
{
    const inputText = DOM.inputText.value;

    if(inputText.length >= Config.textLenght)
    {
        const texts = inputText.match(RegExp(`.{1,${Config.textLenght}}`, 'g'));
        const responses = await sendMutiple(texts);

        console.log(texts);
        console.log(responses);
        
        DOM.outputText.value = "";
        for(const response of responses)
        {
            DOM.outputText.value += parseText(applyCorrection(response)) + '\n';
        }
    }
    else
    {
        DOM.outputText.value = parseText(applyCorrection(await send(inputText)));
    }
}

function sendMutiple(texts)
{
    return new Promise((resolve, reject) => {

        const responses = [];
        let index = 0;

        let waiting = false;

        const intervalID = setInterval(async () => 
        {    
            if(waiting) return;

            try {
                waiting = true;

                const request = await send(texts[index])

                if(request.status)
                {
                    throw request;
                }

                responses.push(request);
                index++;

                if(index === texts.length)
                {
                    clearInterval(intervalID);
                    resolve(responses);
                }

                waiting = false;
            }
            catch (error) {
                console.error(error);
                waiting = false;
            }

        }, Config.interval);
    });
}

async function send(inputText) 
{
    console.log('sending', inputText);

    const body = {
        "language": "fra",
        "text": inputText,
        "autoReplace": true,
        "interfaceLanguage": "en",
        "locale": "Indifferent",
        "origin": "interactive",
        "generateSynonyms": false,
        "generateRecommendations": false,
        "getCorrectionDetails": true
    };

    const request = await fetch("https://orthographe.reverso.net/api/v1/Spelling", {
        'method': 'POST',
        'headers' : {
            'accept': 'application/json, text/javascript, */*; q=0.01',
            'accept-encoding': 'gzip, deflate, br',
            'accept-language': 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7',
            'content-type': 'application/json',
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.212 Safari/537.36',
            'content-length' : body.lenght,
        },
        'body': JSON.stringify(body)
    });
    
    return await request.json();
}

function applyCorrection(response)
{
    let text = response.text;

    const corrections = new Map();

    for(const correction of response.corrections)
    {
        let start = text.substring(0, correction.startIndex);

        // remplacer dans la chaine le mot par #1**** pour qu'il atteigne la meme taille que le mot a remplacer et ensuite faire un remplacement a la fin
        // pour les caractère seuls on utilise \u0001, \u0002, \u0003...

        console.log('-------- ', start);

        if(correction.suggestions[0])
        {
            const index = buildIndexationString((correction.endIndex - correction.startIndex) + 1);
            corrections.set(index, correction.suggestions[0].text);
            start += index;

            console.log(start);
        }
        else
        {
            start += text.substring(correction.startIndex, correction.endIndex);
        }

        let end = text.substring(correction.endIndex + 1, text.lenght);

        console.log('end', end);

        text = start + end;
    }

    console.log(corrections)

    for(let correction of corrections.entries())
    {
        if(text[text.indexOf(correction[0]) + correction[0].length] !== " ")
        {
            correction[1] += " ";
        }
        
        text = text.replace(correction[0], correction[1]);
    }

    return text;
}

let unicodeActualIndex = '\uffff';
let numberActualIndex = 0;

function buildIndexationString(lenght)
{
    if(lenght <= 0 || lenght >= 1000) 
    {
        console.error('invalid lenght');
        return null;
    }

    let index = null;

    console.log('lenght', lenght);

    if(lenght < 4)
    {   
        unicodeActualIndex = String.fromCharCode(unicodeActualIndex.charCodeAt(0) - 1);
    
        index = unicodeActualIndex;

        for(let i = 1; i < lenght; i++)
        {
            index += '*';
        }
    }
    else
    {
        index = '#';

        if(numberActualIndex < 10)
        {
            index += `00${numberActualIndex}`; 
        }
        else if(numberActualIndex > 10 && numberActualIndex < 100)
        {
            index += `0${numberActualIndex}`;
        }
        else if(numberActualIndex > 10 && numberActualIndex > 100 && numberActualIndex < 1000)
        {
            index += `${numberActualIndex}`;
        }

        for(let i = 4; i < lenght; i++)
        {
            index += '*';
        }

        numberActualIndex++;
    }

    return index;
}

function parseText(text)
{
    return text;
}

document.getElementById('send').addEventListener('click', () => sender());