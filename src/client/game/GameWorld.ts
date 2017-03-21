import { GameObject, IGameObjectData } from "../GameObject";
import { Helper } from "../Helper";
import { Remote } from "../Remote";


export abstract class GameWorld
{
	private id : string;
	private gameObjects = new Map<string, GameObject>();

	constructor()
	{
		this.id = Helper.generateID();
	}

	public initialize()
	{
		//TODO: initialize
	}

	public add<T extends GameObject>(object : T) : T
	{
		object.preInitialize(this);
		object.initialize();
		this.gameObjects.set(object.id, object);
		return object;
	}

	public getCreationData() : {}
	{
		let data = {
			id : this.id,
			type: this.constructor.name,
			objects : new Array<IGameObjectData>(this.gameObjects.size)
		};
		let i = 0;

		this.gameObjects.forEach(object => {
			data.objects[i++] = <IGameObjectData>{
				id: object.id,
				type: (object as any).constructor.name,
				properties: Remote.getProperties(object)
			};
		});

		return data;
	}
}
