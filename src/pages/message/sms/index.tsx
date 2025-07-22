import React, {useRef, useState} from "react";

import {ActionType, PageContainer, ProTable} from "@ant-design/pro-components";
import {request, useIntl, history} from "@umijs/max";
import {Button, message, Popconfirm, Tag} from "antd";
import {useAccess} from "@@/exports";
import Model from "@/components/Model";

const Sms: React.FC = () => {
  const intl = useIntl()
  const ref = useRef<ActionType>()
  const permissionMap = useAccess();
  const path = history.location.pathname
  const write = permissionMap[path]
  const columns: any[] = [
    {
      title: intl.formatMessage({id: 'pages.common.id'}),
      dataIndex: 'id',
      valueType: 'text',
      width: 50,
    },
    {
      title: intl.formatMessage({id: 'pages.common.email'}),
      dataIndex: 'email',
      copyable: true,
      width: 200
    },
    {
      title: intl.formatMessage({id: 'pages.common.type'}),
      dataIndex: 'type',
      valueType: 'select',
      width: 150,
      request: async () => {
        const {data} = await request('/api/chat/system/sys-dict/options', {params: {parentCode: 'Message_Type'}});
        return data;
      },
    },
    {
      title: intl.formatMessage({id: 'pages.common.captcha'}),
      dataIndex: 'code',
      valueType: 'text',
      width: 100,
      hideInSearch: true,
    },
    {
      title: intl.formatMessage({id: 'pages.email.subject'}),
      dataIndex: 'subject',
      width: 150,
      ellipsis: true,
    },
    {
      title: intl.formatMessage({id: 'pages.common.status'}),
      dataIndex: 'state',
      valueType: 'select',
      width: 80,
      render: (text: any, record: any, _: any, action: any) => {
        return <Tag
          color={record.state === 1 ? 'gray' : 'green'}>{record.state === 1 ? intl.formatMessage({id: 'pages.common.unusable'}) : intl.formatMessage({id: 'pages.common.used'})}</Tag>
      },
      hideInSearch: true,
    },
    {
      title: intl.formatMessage({id: 'pages.email.content'}),
      dataIndex: 'body',
      width: 80,
      hideInTable: true,
    },

    {
      title: intl.formatMessage({id: 'pages.common.option'}),
      valueType: 'option',
      fixed: 'right',
      render: (text: any, record: any, _: any, action: any) => write && [
        <Model
          key={'preview'}
          buttonText={intl.formatMessage({id: 'pages.common.preview'})}
          title={intl.formatMessage({id: 'pages.email.content'})}
          text={record.body}
        />,
        <Popconfirm
          key={'delete'}
          title={intl.formatMessage({id: 'pages.confirm.delete'})}
          onConfirm={async () => {
            const {code, message: msg} = await request('/api/chat/system/msg/sms/delete', {
              method: 'GET',
              params: {id: record.id}
            });
            if (code === 200) {
              message.success(msg)
            } else {
              message.error(msg)
            }
            action?.reload()
          }}
        >
          <Button type={'link'}
          >
            {intl.formatMessage({id: 'pages.common.delete'})}
          </Button>
        </Popconfirm>
      ],
    }
  ]
  return (
    <PageContainer>
      <ProTable
        actionRef={ref}
        rowKey={'user'}
        columns={columns}
        request={async (params) => request('/api/chat/system/msg/sms/list', {method: 'POST', data: params})}
      />
    </PageContainer>
  );
};

export default Sms;
