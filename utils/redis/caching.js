const dotenv = require("dotenv");
dotenv.config();

const redis = require("ioredis");
const express = require("express");
const { Request, Response, NextFunction } = require("express");
let redis;

// Redis 캐시에서 키 데이터 가져오기
async function getCache(key) {
  try {
    const cacheData = await redis.get(key);
    return cacheData;
  } catch (err) {
    return null;
  }
}

// 지정된 만료 시간으로 Redis 캐시 키 설정
function setCache(key, data, ttl = REDIS_TTL) {
  try {
    redis.set(key, JSON.stringify(data), "EX", ttl);
  } catch (err) {
    return null;
  }
}

// 주어진 Redis 캐시 키 제거
function removeCache(key) {
  try {
    redis.del(key);
  } catch (err) {
    return null;
  }
}

module.exports = { getCache, setCache, removeCache };
