const form = document.getElementById('calc-form')
const answerDiv = document.getElementById('answer')
answerDiv.style.visibility='hidden'

const ipCheck = (ip)=>{
    for (i of ip){
        if (i<=255){
            continue;
        } else {
            alert('Recuerda que el valor máximo de cada campo es de 255')
            return 1;
        }
    }
}

const snCheck = (n)=>{
if (n > 64){
    alert('No pueden haber más de 64 Subredes')
    return 1;
}
}

form.addEventListener('submit',(e)=>{
    e.preventDefault()
    answerDiv.innerHTML=''
    const n = e.target.SNnumber.value
    const network = e.target.IPnumber.value.split('.')
    let CIDR

    if (network[0]<=127){
        CIDR = 8
    } else if (network[0]<=191){
        CIDR = 16
    } else if (network[0]<=223){
        CIDR = 24
    }

    err = ipCheck(network)
    err = snCheck(n)

    if (err) {
        alert('Problema con los valores')
        return;
    } else {
        answerDiv.style.visibility='visible'
        let pw = 0
        let mask = 0
        let h = 0
        let nm = 0
        let tSN

        while (true) {
            tSN = 2**pw
            if ((tSN)<n){
                pw++
                mask += 2**(8-pw)
                continue
            } else {
                h = (2**(8-pw))-2
                nm = 256-mask
                break;
            }
        }

        answerDiv.innerHTML = "<h4>Posibles subredes:</h4>"

        answerDiv.insertAdjacentHTML('afterbegin',`Máscara: 255.255.255.${mask}`)

        console.log(network, pw, h, nm , mask);

        const baseAddress = JSON.parse(JSON.stringify(network))

        for (let i=0;i<tSN;i++){
            baseAddress.pop()
            const minAddress = JSON.parse(JSON.stringify(baseAddress))
            minAddress.push((i*nm)+1)
            const maxAddress = JSON.parse(JSON.stringify(baseAddress))
            maxAddress.push(((i+1)*nm)-2)
            baseAddress.push(i*nm)
            answerDiv.insertAdjacentHTML('beforeend', `<p>${baseAddress}/${CIDR+pw} - Rango válido (${minAddress} - ${maxAddress})</p>`)
            minAddress.pop()
            maxAddress.pop()
        }
    }
})