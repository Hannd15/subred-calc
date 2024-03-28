const WHOLE_BYTE = 255
const MAX_NET_BITS = 30
const OCTATE_SIZE = 8

const Answer=(title, content,answerDiv)=>{
    answerDiv.insertAdjacentHTML ('beforeend',
        `<div class="answer-section">
        <strong>${title}:</strong>
        <br>
        ${content}
        </div>`
    )
}

const updateMasks = (netBits, maskSelect)=>{
    maskSelect.innerHTML=''
    for (let i = netBits; i <= MAX_NET_BITS; i++) {
        maskSelect.insertAdjacentHTML('beforeend',`<option value="${i}">${i}</option>`)
    }
}

function fillMasks() {
    const select = document.getElementById('maskNumber')
    switch (document.getElementById('CIDR').value) {
        case "A":
            updateMasks(8, select)
            break;
        case "B":
            updateMasks(16, select)
            break;
        case "C":
            updateMasks(24, select)
            break;
        default:
            break;
    }
}

fillMasks()

document.getElementById('CIDR').addEventListener('change',()=>{
    fillMasks()
})

function fillNetMask(CIDR,extraBits,magicNumber) {
    const subNetMask = []
    for (i=0;i<Math.floor(CIDR/OCTATE_SIZE);i++){
        subNetMask.push(WHOLE_BYTE)
    }
    while (subNetMask.length<4){
        if (extraBits>OCTATE_SIZE){
            subNetMask.push(WHOLE_BYTE)
            extraBits-=OCTATE_SIZE
        }else if (extraBits){
            subNetMask.push(WHOLE_BYTE-magicNumber)
            extraBits = 0
        }else if (!extraBits) {
            subNetMask.push(0)            
        }
    }
    return subNetMask
}

function bitsToOctates(bits) {
    return [Math.floor(bits/OCTATE_SIZE), bits%OCTATE_SIZE]
}

function fillNetAddr(defOct,ip,magicNumber){
    const netAddr = []
    for (i=0;i<defOct;i++){
        netAddr.push(ip[i])
    }
    netAddr.push(0)
    while (ip[defOct]>(netAddr[defOct]+magicNumber+1)) {
        netAddr[defOct] += magicNumber+1
    }
    while (netAddr.length<4){
        netAddr.push(0)
    }
    return netAddr
}

function getNetAddrRange(start, defOct,magicNumber) {
    const endingIP = []
    const startingIP = structuredClone(start)
    startingIP[3]+=1
    for (i=0;i<4;i++){
        if (i<defOct){
            endingIP.push(start[i])
        }else if (i==defOct){
            endingIP.push(startingIP[i]+magicNumber)
        }else{
            endingIP.push(WHOLE_BYTE)
        }
    }
    if (endingIP[3]==255){
        endingIP[3]-=1
    }else{
        endingIP[3]-=2
    }
    return [startingIP,endingIP]
}

function getBroadcastAddr(lastAddr) {
    const broadcast = structuredClone(lastAddr)
    broadcast[3]+=1
    return broadcast
}

function getPossibleNet(ip,possibleSubNets,startingOctates,magicNumber) {
    const possibleAddresses = []
    let buffAddress = []
    for (i=0;i<4;i++){
        if(i<startingOctates){
            buffAddress.push(ip[i])
        }else{
            buffAddress.push(0)
        }
    }
    for (j=0;j<possibleSubNets;j++){
        const range = structuredClone(getNetAddrRange(buffAddress,startingOctates,magicNumber))
        possibleAddresses.push(range)
        buffAddress=range[1].map((x)=>{
            if (x==255 || x == 254){
                return 0
            }else{
                return x
            }
        })
        buffAddress[startingOctates]+=1
    }
    return possibleAddresses
}



document.getElementById('calc-form').addEventListener('submit',(e)=>{
    e.preventDefault()
    const ip = document.getElementById('IPnumber').value.split('.')
    const ipClass = document.getElementById('CIDR').value
    const answerDiv = document.getElementById('answer')

    answerDiv.innerHTML=''

    let defCIDR
    switch (ipClass) {
        case "A":
            defCIDR = OCTATE_SIZE
            break;
        case "B":
            defCIDR = OCTATE_SIZE * 2
            break;
        case "C":
            defCIDR = OCTATE_SIZE * 3
            break;
        default:
            break;
    }

    const inCIDR = document.getElementById('maskNumber').value

    let extraBits = inCIDR-defCIDR
    const magicNumber = WHOLE_BYTE>>(extraBits%OCTATE_SIZE)
    const possibleSubNets = 2**(extraBits%OCTATE_SIZE)

    const startingOctates = bitsToOctates(inCIDR)[0]

    const NetworkAddress = fillNetAddr(startingOctates,ip,magicNumber)
    const UsableHostsRange = getNetAddrRange(NetworkAddress,startingOctates,magicNumber)
    const BroadcastAddress = getBroadcastAddr(UsableHostsRange[1])
    const NetworkMask = fillNetMask(defCIDR,extraBits,magicNumber)
    const PossibleSubNets = getPossibleNet(ip, possibleSubNets, startingOctates,magicNumber)

    Answer('Dirección IP',ip.join('.'),answerDiv)
    Answer('Dirección de red',NetworkAddress.join('.'),answerDiv)
    Answer('Rango de hosts usables',UsableHostsRange.map((i)=>i.join('.')).join('-'),answerDiv)
    Answer('Broadcast',BroadcastAddress.join('.'),answerDiv)
    Answer('Máscara de subnet',NetworkMask.join('.'),answerDiv)

    console.log(PossibleSubNets);
    
    answerDiv.insertAdjacentHTML('beforeend',`
    <div class="answer-section">
        <strong>Posibles Subnets:</strong>
        <br>
        ${PossibleSubNets.map((r)=>{
            return (
                r.map((i)=>{
                    return i.join('.')
                })
            ).join('-')+'<br>'
        }).join('')}
    </div>`)

    answerDiv.style.visibility='visible'

})