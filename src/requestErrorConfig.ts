﻿import type {RequestOptions} from '@@/plugin-request/request';
import type {RequestConfig} from '@umijs/max';
import {message, notification} from 'antd';
import {getLocale} from "@@/exports";
import {ErrorShowType, ResponseStructure} from "@/services/entity/Common";



/**
 * @name 错误处理
 * pro 自带的错误处理， 可以在这里做自己的改动
 * @doc https://umijs.org/docs/max/request#配置
 */
export const errorConfig: RequestConfig = {
  // 错误处理： umi@3 的错误处理方案。
  errorConfig: {
    // 错误抛出
    errorThrower: (res) => {
      const {success, data, errorCode, errorMessage, showType} =
        res as unknown as ResponseStructure<any>;
      if (!success) {
        const error: any = new Error(errorMessage);
        error.name = 'BizError';
        error.info = {errorCode, errorMessage, showType, data};
        throw error; // 抛出自制的错误
      }
    },
    // 错误接收及处理
    errorHandler: (error: any, opts: any) => {
      if (opts?.skipErrorHandler) throw error;
      // 我们的 errorThrower 抛出的错误。
      if (error.name === 'BizError') {
        const errorInfo: ResponseStructure<any> | undefined = error.info;
        if (errorInfo) {
          const {errorMessage, errorCode} = errorInfo;
          switch (errorInfo.showType) {
            case ErrorShowType.SILENT:
              // do nothing
              break;
            case ErrorShowType.WARN_MESSAGE:
              message.warning(errorMessage);
              break;
            case ErrorShowType.ERROR_MESSAGE:
              message.error(errorMessage);
              break;
            case ErrorShowType.NOTIFICATION:

              notification.open({
                description: errorMessage,
                message: errorCode,
                type: 'error',
              });
              if (errorCode === 401) {
                localStorage.removeItem('token')
                localStorage.removeItem('refreshToken')
                window.location.href = '/login'
              }

              break;
            case ErrorShowType.REDIRECT:
              // TODO: redirect
              break;
            default:
              message.error(errorMessage);
          }
        }
      } else if (error.response) {

        // Axios 的错误
        // 请求成功发出且服务器也响应了状态码，但状态代码超出了 2xx 的范围
        notification.open({
          description: error.response.data.message,
          message: error.response.status,
          type: 'error',
        });
      } else if (error.request) {
        // 请求已经成功发起，但没有收到响应
        // \`error.request\` 在浏览器中是 XMLHttpRequest 的实例，
        // 而在node.js中是 http.ClientRequest 的实例
        message.error('None response! Please retry.');
      } else {
        // 发送请求时出了点问题
        message.error('Request error, please retry.');
      }
    },
  },

  // 请求拦截器
  requestInterceptors: [
    (config: RequestOptions) => {
      // 拦截请求配置，进行个性化处理。
      // const url = config?.url?.concat('?token = 123');
      config.headers = {
        ...config.headers,
        'Accept-Language': getLocale(),
      }
      let item = localStorage.getItem('token');
      if (item) {
        config.headers.Authorization = "Bearer " + item
      }
      return {...config};
    },
  ],

  // 响应拦截器
  responseInterceptors: [
    (response: ResponseStructure<any>) => {
      // 拦截响应数据，进行个性化处理
      const {data} = response;
      data.success = data.code === 200
      if (data?.success === false) {
        data.errorMessage = data.message
        data.errorCode = data.code
        data.showType = ErrorShowType.NOTIFICATION
      }
      return response;
    },
  ],
};
