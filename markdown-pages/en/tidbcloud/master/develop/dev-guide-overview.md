---
title: Developer Guide Overview
summary: Introduce the overview of the developer guide.
---

# Developer Guide Overview

<IntroBanner title="Learn TiDB Cloud basics" content="TiDB Cloud is the fully-managed service built on top of TiDB, which is highly compatible with the MySQL protocol and supports most MySQL syntax and features." videoTitle="TiDB Cloud in 3 minutes" thumbnail="https://i.ytimg.com/vi/skCV9BEmjbo/mqdefault.jpg">
  <IntroBannerVideo>
    <iframe width="800" height="450" src="https://www.youtube.com/embed/skCV9BEmjbo?autoplay=1" title="TiDB Cloud in 3 minutes" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen tabindex="-1"></iframe>
  </IntroBannerVideo>
</IntroBanner>

## Guides by language and framework

Build your application with the language you use by following the guides with sample codes.

<DevLangAccordion label="JavaScript" defaultExpanded>
<DevToolCard title="Serverless Driver (beta)" logo="tidb" docLink="/tidbcloud/serverless-driver" githubLink="https://github.com/tidbcloud/serverless-js">

Connect to TiDB Cloud over HTTPS in Edge Function.

</DevToolCard>
<DevToolCard title="Next.js" logo="nextjs" docLink="/tidbcloud/dev-guide-sample-application-nextjs" githubLink="https://github.com/vercel/next.js">

Connect Next.js with mysql2 to TiDB Cloud.

</DevToolCard>
<DevToolCard title="Prisma" logo="prisma" docLink="/tidbcloud/dev-guide-sample-application-nodejs-prisma" githubLink="https://github.com/prisma/prisma">

Connect to TiDB Cloud with Prisma ORM.

</DevToolCard>
<DevToolCard title="TypeORM" logo="typeorm" docLink="/tidbcloud/dev-guide-sample-application-nodejs-typeorm" githubLink="https://github.com/typeorm/typeorm">

Connect to TiDB Cloud with TypeORM.

</DevToolCard>
<DevToolCard title="Sequelize" logo="sequelize" docLink="/tidbcloud/dev-guide-sample-application-nodejs-sequelize" githubLink="https://github.com/sequelize/sequelize">

Connect to TiDB Cloud with Sequelize ORM.

</DevToolCard>
<DevToolCard title="mysql.js" logo="mysql" docLink="/tidbcloud/dev-guide-sample-application-nodejs-mysqljs" githubLink="https://github.com/mysqljs/mysql">

Connect Node.js with mysql.js module to TiDB Cloud.

</DevToolCard>
<DevToolCard title="node-mysql2" logo="mysql" docLink="/tidbcloud/dev-guide-sample-application-nodejs-mysql2" githubLink="https://github.com/sidorares/node-mysql2">

Connect Node.js with node-mysql2 module to TiDB Cloud.

</DevToolCard>
<DevToolCard title="AWS Lambda" logo="aws-lambda" docLink="/tidbcloud/dev-guide-sample-application-aws-lambda" githubLink="https://github.com/sidorares/node-mysql2">

Connect AWS Lambda Function with mysql2 to TiDB Cloud.

</DevToolCard>
</DevLangAccordion>

<DevLangAccordion label="Python" defaultExpanded>
<DevToolCard title="Django" logo="django" docLink="/tidbcloud/dev-guide-sample-application-python-django" githubLink="https://github.com/pingcap/django-tidb">

Connect Django application with django-tidb to TiDB Cloud.

</DevToolCard>
<DevToolCard title="MySQL Connector/Python" logo="python" docLink="/tidbcloud/dev-guide-sample-application-python-mysql-connector" githubLink="https://github.com/mysql/mysql-connector-python">

Connect to TiDB Cloud with MySQL official package.

</DevToolCard>
<DevToolCard title="PyMySQL" logo="python" docLink="/tidbcloud/dev-guide-sample-application-python-pymysql" githubLink="https://github.com/PyMySQL/PyMySQL">

Connect to TiDB Cloud with PyMySQL package.

</DevToolCard>
<DevToolCard title="mysqlclient" logo="python" docLink="/tidbcloud/dev-guide-sample-application-python-mysqlclient" githubLink="https://github.com/PyMySQL/mysqlclient">

Connect to TiDB Cloud with mysqlclient package.

</DevToolCard>
<DevToolCard title="SQLAlchemy" logo="sqlalchemy" docLink="/tidbcloud/dev-guide-sample-application-python-sqlalchemy" githubLink="https://github.com/sqlalchemy/sqlalchemy">

Connect to TiDB Cloud with SQLAlchemy ORM.

</DevToolCard>
<DevToolCard title="peewee" logo="peewee" docLink="/tidbcloud/dev-guide-sample-application-python-peewee" githubLink="https://github.com/coleifer/peewee">

Connect to TiDB Cloud with Peewee ORM.

</DevToolCard>
</DevLangAccordion>

<DevLangAccordion label="Java">
<DevToolCard title="JDBC" logo="java" docLink="/tidbcloud/dev-guide-sample-application-java-jdbc" githubLink="https://github.com/mysql/mysql-connector-j">

Connect to TiDB Cloud with JDBC (MySQL Connector/J).

</DevToolCard>
<DevToolCard title="MyBatis" logo="mybatis" docLink="/tidbcloud/dev-guide-sample-application-java-mybatis" githubLink="https://github.com/mybatis/mybatis-3">

Connect to TiDB Cloud with MyBatis ORM.

</DevToolCard>
<DevToolCard title="Hibernate" logo="hibernate" docLink="/tidbcloud/dev-guide-sample-application-java-hibernate" githubLink="https://github.com/hibernate/hibernate-orm">

Connect to TiDB Cloud with Hibernate ORM.

</DevToolCard>
<DevToolCard title="Spring Boot" logo="spring" docLink="/tidbcloud/dev-guide-sample-application-java-spring-boot" githubLink="https://github.com/spring-projects/spring-data-jpa">

Connect Spring based application with Spring Data JPA to TiDB Cloud.

</DevToolCard>
</DevLangAccordion>

<DevLangAccordion label="Go">
<DevToolCard title="Go-MySQL-Driver" logo="go" docLink="/tidbcloud/dev-guide-sample-application-golang-sql-driver" githubLink="https://github.com/go-sql-driver/mysql">

Connect to TiDB Cloud with MySQL driver for Go.

</DevToolCard>
<DevToolCard title="GORM" logo="gorm" docLink="/tidbcloud/dev-guide-sample-application-golang-gorm" githubLink="https://github.com/go-gorm/gorm">

Connect to TiDB Cloud with GORM.

</DevToolCard>
</DevLangAccordion>

<DevLangAccordion label="Ruby">
<DevToolCard title="Ruby on Rails" logo="rails" docLink="/tidbcloud/dev-guide-sample-application-ruby-rails" githubLink="https://github.com/rails/rails/tree/main/activerecord">

Connect Ruby on Rails application with Active Record ORM to TiDB Cloud.

</DevToolCard>
<DevToolCard title="mysql2" logo="ruby" docLink="/tidbcloud/dev-guide-sample-application-ruby-mysql2" githubLink="https://github.com/brianmario/mysql2">

Connect to TiDB Cloud with mysql2 driver.

</DevToolCard>
</DevLangAccordion>

In addition to these guides, PingCAP works with the community to [support the third-party MySQL driver, ORMs and tools](/tidbcloud/dev-guide-third-party-support).

## Use MySQL client software

As TiDB is a MySQL-compatible database, you can use many client software tools to connect to TiDB Cloud and management the databases just like you did before. Or, use our [command line tool](/tidbcloud/get-started-with-cli) to connect and manage your databases.

<DevToolGroup>
<DevToolCard title="MySQL Workbench" logo="mysql-1" docLink="/tidbcloud/dev-guide-gui-mysql-workbench">

Connect and manage TiDB Cloud databases with MySQL Workbench.

</DevToolCard>
<DevToolCard title="Visual Studio Code" logo="vscode" docLink="/tidbcloud/dev-guide-gui-vscode-sqltools">

Connect and manage TiDB Cloud databases with SQLTools extension in VSCode.

</DevToolCard>
<DevToolCard title="DBeaver" logo="dbeaver" docLink="/tidbcloud/dev-guide-gui-dbeaver">

Connect and manage TiDB Cloud databases with DBeaver.

</DevToolCard>
<DevToolCard title="DataGrip" logo="datagrip" docLink="/tidbcloud/dev-guide-gui-datagrip">

Connect and manage TiDB Cloud databases with DataGrip by JetBrains.

</DevToolCard>
</DevToolGroup>

## Additional resources

Learn other topics about developing with TiDB Cloud.

- Use [TiDB Cloud CLI](/tidbcloud/get-started-with-cli) to develop, manage and deploy your applications.
- Explore popular [services integrations](/tidbcloud/integrate-tidbcloud-with-airbyte) with TiDB Cloud.
- Use [TiDB database development reference](/tidbcloud/dev-guide-schema-design-overview) to design, interact, optimize and troubleshoot with your data and schema.
- Follow free online course of [Introduction to TiDB](https://eng.edu.pingcap.com/catalog/info/id:203/?utm_source=docs-dev-guide).
