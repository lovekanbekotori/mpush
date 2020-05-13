import { Config } from "../Config";
import * as Jsonwebtoken from 'jsonwebtoken'
/**
 * 客户端 -> 服务端  
 * 数据包基本结构类
 */
export class ClientSocketPacket {
  public readonly cmd: 'AUTH' | 'MESSAGE' | 'MESSAGE_CALLBACK' | 'MESSAGE_FCM_CALLBACK' | 'REGISTER_FCM' | 'PING'
  public readonly data: any
  public readonly auth: {
    name: string,
    group: string
  }

  constructor(json: any) {
    try {
      this.cmd = json.cmd
      this.data = json.data
      if (typeof json.auth === 'string') {
        this.auth = <{
          name: string,
          group: string
        }>Jsonwebtoken.verify(json.auth, Config.token)
      }
    } catch (e) {
      throw new Error(`parse ClientSocketPacket error: ${e.message}`)
    }
  }
}
export class AuthClientSocketPacket extends ClientSocketPacket {
  public readonly data: {
    token: string,
    name: string,
    group: string
  }
  constructor(packet: ClientSocketPacket) {
    super(packet)
    this.data = {
      token: String(packet?.data?.token || ""),
      name: String(packet?.data?.name || ""),
      group: String(packet?.data?.group || "")
    }
    if (!this.data.name) {
      throw new Error("name property is required")
    }
  }
}
export class MessageClientSocketPacket extends ClientSocketPacket {
  public readonly data: {
    sendType: "personal" | "group",
    target: string,
    message: {
      text: string,
      desp: string,
      extra: {}
    }
  }
  constructor(packet: ClientSocketPacket) {
    super(packet)
    this.data = {
      sendType: packet.data.sendType === 'personal' ? 'personal' : 'group',
      target: packet.data.target,
      message: {
        text: String(packet?.data?.message?.text || ""),
        desp: String(packet?.data?.message?.desp || ""),
        extra: typeof packet?.data?.message?.extra === 'object' ? packet.data.message.extra : {}
      }
    }
    if (!this.data.target) {
      throw new Error("target property is required")
    }
    if (packet?.data?.sendType !== 'personal' && packet.data.sendType !== 'group') {
      throw new Error("sendType property must 'personal' or 'group'")
    }
  }
}
export class MsgCbClientSocketPacket extends ClientSocketPacket {
  public readonly data: {
    mid: string
  }
  constructor(packet: ClientSocketPacket) {
    super(packet)
    this.data = {
      mid: String(packet?.data?.mid || "")
    }
    if (!this?.data?.mid) {
      throw new Error("mid property is required")
    }
  }
}
export class MsgFcmCbClientSocketPacket extends ClientSocketPacket {
  public readonly data: {
    mid: string
  }
  constructor(packet: ClientSocketPacket) {
    super(packet)
    this.data = {
      mid: String(packet?.data?.mid || "")
    }
    if (!this?.data?.mid) {
      throw new Error("mid property is required")
    }
  }
}
export class RegisterFcmClientSocketPacket extends ClientSocketPacket {
  public readonly data: {
    endpoint: string
    expirationTime: null
    keys: {
      auth: string
      p256dh: string
    }
  }
  constructor(packet: ClientSocketPacket) {
    super(packet)
    this.data = packet?.data
    if (!this?.data?.endpoint) {
      throw new Error("endpoint property is required")
    }
    if (!this?.data?.keys) {
      throw new Error("keys property is required")
    }
  }
}


