export interface IMessage
{
	messagetype : string;
	buffer : ArrayBuffer;
	data : any;
	worldId : string;
}
