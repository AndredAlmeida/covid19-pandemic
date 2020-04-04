function Remap(value, inMin, inMax, outMin, outMax) {
  var tmp = outMin + (value - inMin) * (outMax - outMin) / (inMax - inMin);
  return Math.min(Math.max(tmp, outMin), outMax);
}

function GetBaseLog(x, y) {
  return Math.log(y) / Math.log(x);
}

function Clamp(a,b,c)
{
	return Math.max(b,Math.min(c,a));
}

function NumberWithCommas(x) {
	var ret = x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
	if(ret == "NaN")
		ret = "N/A";
    return ret;
}

function FormatKNumber(number) {
	number = number.toString();
	if(number.length > 3)
		return parseInt(number/1000)+'K';
	else
		return number;
}

function SetCharAt(str,index,chr) {
    if(index > str.length-1) return str;
    return str.substr(0,index) + chr + str.substr(index+1);
}

export { Remap, GetBaseLog, Clamp, NumberWithCommas, FormatKNumber, SetCharAt };