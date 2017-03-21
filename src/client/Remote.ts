enum DIRECTION {BI, SLAVE_TO_MASTER, MASTER_TO_SLAVE};

export class Remote
{
	public static DIRECTION = DIRECTION;
	private static list = new Map<any, IRemoteClass>();

	public static monitor(direction : DIRECTION, noConstructor = false)
	{
		return (targetClass : any, property : string) => {
			Remote.set(targetClass, property, direction, noConstructor);
		};
	}

	private static set(targetClass : any, property : string, type : DIRECTION, noConstructor = false)
	{
		let target = noConstructor ? targetClass : targetClass.constructor;
		let remoteClass = Remote.list.get(target) || <IRemoteClass>{class: target, properties: new Array<IRemoteProperty>()};
		let properties = remoteClass.properties;
		properties.push({
			name: property
		});
		Remote.list.set(target, remoteClass);
	}

	public static augmentClasses()
	{
		Remote.monitor(DIRECTION.BI, true)(THREE.Vector3, "x");
		Remote.monitor(DIRECTION.BI, true)(THREE.Vector3, "y");
		Remote.monitor(DIRECTION.BI, true)(THREE.Vector3, "z");

		Remote.monitor(DIRECTION.BI, true)(THREE.Quaternion, "x");
		Remote.monitor(DIRECTION.BI, true)(THREE.Quaternion, "y");
		Remote.monitor(DIRECTION.BI, true)(THREE.Quaternion, "z");
		Remote.monitor(DIRECTION.BI, true)(THREE.Quaternion, "w");
	}

	public static compileParents()
	{
		this.list.forEach((value, key) => {
			let parents = Remote.getAllParents(value.class);
			parents.forEach(parent => {
				value.properties.push(...Remote.getRemotes(parent).properties);
			});
		});
	}

	public static getAllParents(target : any)
	{
		let current = target;
		let allParents = new Array<Object>();
		let prototype = current.prototype;
		let parent = prototype.__proto__.constructor;
		while (parent !== null && parent !== Function && parent !== Object)
		{
			allParents.push(parent);
			current = parent;
			prototype = current.prototype;
			parent = prototype.__proto__.constructor;
		}
		return allParents;
	}

	public static getRemotes(target : any)
	{
		return Remote.list.get(target) || null;
	}

	public static getProperties(target : any) : IPropertyPair[]
	{
		let remotes = Remote.getRemotes(target.constructor);
		if (remotes === null) { return null; }

		let properties = new Array<IPropertyPair>(remotes.properties.length);
		let i = 0;
		remotes.properties.forEach(value => {
			let property = Remote.traverseProperty(target[value.name]);
			properties[i++] = {key: value.name, value: property};
		});

		return properties;
	}

	public static traverseProperty(property : any)
	{
		if (typeof property === "object")
		{
			let properties = Remote.getProperties(property);
			return properties;
		}
		return property;
	}
}

interface IRemoteClass
{
	class: string;
	properties: Array<IRemoteProperty>;
}

interface IRemoteProperty
{
	name : string;
}

export interface IPropertyPair
{
	key: string;
	value: any;
}
