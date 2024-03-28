const ip = [100,121,149,109]
const ipClass = "A"
const inCIDR = 9

const WHOLE_BYTE = 255
const OCTATE_SIZE = 8

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

function fillNetMask(CIDR) {
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
    return [Math.floor(bits/OCTATE_SIZE), bits%OCTATE_SIZE] // Whole octates with extra bits
}

let extraBits = inCIDR-defCIDR
const magicNumber = WHOLE_BYTE>>(extraBits%OCTATE_SIZE)


function fillNetAddr(defOct){
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

function getNetAddrRange(start, defOct) {
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

const possibleSubNets = 2**(extraBits%OCTATE_SIZE)
const possibleAddresses = []
function getPossibleNet(ip,possibleSubNets,defOct) {
    let buffAddress = []
    for (i=0;i<4;i++){
        if(i<startingOctates){
            buffAddress.push(ip[i])
        }else{
            buffAddress.push(0)
        }
    }
    console.log(buffAddress);
    for (j=0;j<possibleSubNets;j++){
        const range = structuredClone(getNetAddrRange(buffAddress,defOct))
        possibleAddresses.push(range)
        buffAddress=range[1].map((x)=>{
            if (x==255 || x == 254){
                return 0
            }else{
                return x
            }
        })
        buffAddress[defOct]+=1
    }
    return possibleAddresses
}

const startingOctates = bitsToOctates(inCIDR)[0]

const NetworkAddress = fillNetAddr(startingOctates)
const UsableHostsRange = getNetAddrRange(NetworkAddress,startingOctates)
const BroadcastAddress = getBroadcastAddr(UsableHostsRange[1])
const NetworkMask = fillNetMask(defCIDR)


console.log(NetworkAddress);
console.log(UsableHostsRange);
console.log(BroadcastAddress);
console.log(NetworkMask);

console.log(getPossibleNet(ip, possibleSubNets, startingOctates));
