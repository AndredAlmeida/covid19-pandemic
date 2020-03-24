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
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export { Remap, GetBaseLog, Clamp, NumberWithCommas };