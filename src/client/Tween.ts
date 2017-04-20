
export class Tween
{
	public static enabled = !isWorker();
	private static properties = new Array<any>();

	public static tickrate = 3;

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

	public static update()
	{
		if (Tween.enabled)
		{
			Tween.properties.forEach(prop => {
				if ( Date.now() - prop.time < 200 )
				{
					prop.value += prop.distance / Tween.tickrate;
				}
			});
		}
	}
}

function isWorker()
{
	return typeof importScripts === "function";
}