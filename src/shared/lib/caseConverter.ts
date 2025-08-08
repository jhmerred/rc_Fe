/**
 * 스네이크 케이스를 카멜 케이스로 변환하는 유틸리티
 */

type SnakeToCamelCase<S extends string> = S extends `${infer T}_${infer U}`
  ? `${T}${Capitalize<SnakeToCamelCase<U>>}`
  : S;

type SnakeToCamelObject<T> = T extends Array<infer U>
  ? Array<SnakeToCamelObject<U>>
  : T extends object
  ? {
      [K in keyof T as SnakeToCamelCase<K & string>]: SnakeToCamelObject<T[K]>;
    }
  : T;

/**
 * 문자열을 스네이크 케이스에서 카멜 케이스로 변환
 */
function toCamelCase(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

/**
 * 문자열을 카멜 케이스에서 스네이크 케이스로 변환
 */
function toSnakeCase(str: string): string {
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

/**
 * 객체의 키를 스네이크 케이스에서 카멜 케이스로 변환
 * 중첩된 객체와 배열도 재귀적으로 처리
 */
export function snakeToCamel<T>(obj: T): SnakeToCamelObject<T> {
  if (obj === null || obj === undefined) {
    return obj as SnakeToCamelObject<T>;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => snakeToCamel(item)) as SnakeToCamelObject<T>;
  }

  if (typeof obj === 'object' && obj !== null) {
    const converted: any = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const camelKey = toCamelCase(key);
        converted[camelKey] = snakeToCamel(obj[key]);
      }
    }
    return converted;
  }

  return obj as SnakeToCamelObject<T>;
}

/**
 * 객체의 키를 카멜 케이스에서 스네이크 케이스로 변환
 * 요청 시 필요한 경우 사용
 */
export function camelToSnake<T>(obj: T): any {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => camelToSnake(item));
  }

  if (typeof obj === 'object' && obj !== null) {
    const converted: any = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const snakeKey = toSnakeCase(key);
        converted[snakeKey] = camelToSnake(obj[key]);
      }
    }
    return converted;
  }

  return obj;
}