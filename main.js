const form = document.getElementById('calc-form')
const answerDiv = document.getElementById('answer')
const maskSelect = document.getElementById('maskNumber')
const selectCIDR = document.getElementById('CIDR')

const TOTAL_OCTATES = 4
const MAX_NET_BITS = 30
const WHOLE_BYTE = 255
let netOct
let hostOct

const Answer=(title, content)=>{
    answerDiv.insertAdjacentHTML ('beforeend',
        `<div class="answer-section">
        <strong>${title}:</strong>
        <br>
        ${content}
        </div>`
    )
}

const ipCheck = (ip)=>{
    const hostOct = TOTAL_OCTATES - netOct
    for (i of ip){
        if (i<=WHOLE_BYTE){
            continue;
        } else {
            return 1;
        }
    }
    return 0;
}

const cidrCheck =(ip,CIDR)=>{
    switch (CIDR) {
        case "A":
            if (ip[0]<127){
                netOct = 1
                break
            }else{
                alert("Las redes tipo A no pueden tener ese número de red")
                return 1
            }
        case "B":
            if (ip[0]<191 && ip[0]>128){
                netOct = 2
                break
            }else{
                alert("Las redes tipo B no pueden tener ese número de red")
                return 1
            }
        case "C":
            if (ip[0]<223 && ip[0]>192){
                netOct = 3
                break
            }else{
                alert("Las redes tipo C no pueden tener ese número de red")
                return 1
            }
    }
    return 0
}

const updateMasks = (netBits)=>{
    maskSelect.innerHTML=''
    for (let i = netBits; i <= MAX_NET_BITS; i++) {
        maskSelect.insertAdjacentHTML('beforeend',`<option value="${i}">${i}</option>`)
    }
}

updateMasks(8)

selectCIDR.addEventListener('change',(e)=>{
    switch (e.target.value) {
        case "A":
            updateMasks(8)
            break;
        case "B":
            updateMasks(16)
            break;
        case "C":
            updateMasks(24)
            break;
        default:
            break;
    }
})

form.addEventListener('submit',(e)=>{
    e.preventDefault()
    answerDiv.innerHTML=''
    const network = e.target.IPnumber.value.split('.')
    const CIDR = e.target.CIDR.value
    const subNetMask = e.target.maskNumber.value
    const netMask = []

    err = ipCheck(network)
    err = cidrCheck(network,CIDR)

    if (!err){
        netOct=Math.floor(subNetMask/8)
        hostOct=TOTAL_OCTATES-netOct
        const magicNumber = WHOLE_BYTE>>(subNetMask%8)
        const extraBits = WHOLE_BYTE-magicNumber
        for (i=0;i<netOct;i++){
            netMask.push(WHOLE_BYTE)
        }
        for (i=0;i<hostOct;i++){
            netMask.push(i===0?(extraBits):0)
        }

        answerDiv.style.visibility='visible'
        Answer('Máscara de subred',netMask.join('.'))
        
        const netAddress = []
        for(i=0;i<TOTAL_OCTATES;i++){
            if (netMask[i] && netMask[i]===WHOLE_BYTE){
                netAddress.push(network[i])
            }else{
                netAddress.push(0)
            }
        }
        Answer('Dirección de subred',netAddress.join('.'))

        const firstUsableAddress = []
        const lastUsableAddress = []
        for (i=0;i<netOct;i++){
            firstUsableAddress.push(netAddress[i])
            lastUsableAddress.push(netAddress[i])
        }

        Answer('Rango de hosts usables',`${firstUsableAddress.join('.')} - ${lastUsableAddress.join('.')}`)
    }
})