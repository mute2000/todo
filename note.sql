---创建表以及表结构
create table if not exists notes  (
    id int auto_increment primary key,
    title varchar(255) not null,
    description varchar(255),
    created_at timestamp default current_timestamp,
    done tinyint(1) default 0,
    deleted tinyint(1) not null default 0,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL DEFAULT NULL;
);
---表中内容
-- id:每个任务的唯一标识符，自动递增。
-- title:任务的标题,必填字段。
-- description:任务的描述信息。
-- created_at:任务的创建时间,在插入数据后自动添加当前时间。
-- done:任务是否已完成的标志,使用TINYINT(1)类型表示,0表示未完成,1表示已完成。
-- updated_at:最后更新时间
-- deleted:标记数据是否已被删除
