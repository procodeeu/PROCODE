// Generated by nitro
import type { Serialize, Simplify } from "nitropack/types";
declare module "nitropack/types" {
  type Awaited<T> = T extends PromiseLike<infer U> ? Awaited<U> : T
  interface InternalApi {
    '/api/auth/login': {
      'post': Simplify<Serialize<Awaited<ReturnType<typeof import('../../server/api/auth/login.post').default>>>>
    }
    '/api/auth/logout': {
      'post': Simplify<Serialize<Awaited<ReturnType<typeof import('../../server/api/auth/logout.post').default>>>>
    }
    '/api/auth/register': {
      'post': Simplify<Serialize<Awaited<ReturnType<typeof import('../../server/api/auth/register.post').default>>>>
    }
    '/api/chat': {
      'post': Simplify<Serialize<Awaited<ReturnType<typeof import('../../server/api/chat.post').default>>>>
    }
    '/__nuxt_error': {
      'default': Simplify<Serialize<Awaited<ReturnType<typeof import('../../node_modules/nuxt/dist/core/runtime/nitro/handlers/renderer').default>>>>
    }
    '/__nuxt_island/**': {
      'default': Simplify<Serialize<Awaited<ReturnType<typeof import('../../server/#internal/nuxt/island-renderer').default>>>>
    }
  }
}
export {}