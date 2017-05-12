
export class Tween
{
	public static enabled = !isWorker();
	private static properties = new Array<any>();

	public static tickrate = 20;

	public static simple(target : any, property : string)
	{
		if (Tween.enabled)
		{
			let prop = {
				realValue: 0,
				value: 0,
				name: property,
				distance: 0,
				time : Date.now(),
				first: true
			};
			Tween.properties.push(prop);
			Object.defineProperty(target, property, {get: () => prop.value, set: (value) => {
				if (prop.first) {
					prop.value = value;
					prop.realValue = value;
					prop.first = false;
				}
				else
				{
					prop.realValue = value;
					prop.distance = value - prop.value;
				}
				prop.time = Date.now();
			}});
		}
	}

	public static simpleRecursive(target : any, pattern : RegExp, original : object = null)
	{
		if (!original) { original = target; }
		for (let prop in target)
		{
			if (target[prop] === original) { continue; }

			if (typeof target[prop] === "object")
			{
				Tween.simpleRecursive(target[prop], pattern, original);
			}
			else if (pattern.test(prop))
			{
				Tween.simple(target, prop);
			}
		}
	}

	public static update()
	{
		if (Tween.enabled)
		{
			Tween.properties.forEach(prop => {
				if ( Date.now() - prop.time < 50 )
				{
					prop.value += prop.distance / 3;
				}
			});
		}
	}
}

function isWorker()
{
	return typeof importScripts === "function";
}