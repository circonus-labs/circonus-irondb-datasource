FROM centos:7 as distro
ENV container docker
RUN (cd /lib/systemd/system/sysinit.target.wants/; for i in *; do [ $i == \
systemd-tmpfiles-setup.service ] || rm -f $i; done); \
rm -f /lib/systemd/system/multi-user.target.wants/*;\
rm -f /etc/systemd/system/*.wants/*;\
rm -f /lib/systemd/system/local-fs.target.wants/*; \
rm -f /lib/systemd/system/sockets.target.wants/*udev*; \
rm -f /lib/systemd/system/sockets.target.wants/*initctl*; \
rm -f /lib/systemd/system/basic.target.wants/*;\
rm -f /lib/systemd/system/anaconda.target.wants/*;
VOLUME [ "/sys/fs/cgroup" ]

# Install pre-reqs and utilities
RUN yum install -y curl initscripts urw-fonts git && yum clean all

# Install Node.js
FROM distro as nodejs
ENV PATH "$PATH:/usr/local/lib/nodejs/bin"
RUN curl -s -N https://nodejs.org/dist/v14.17.6/node-v14.17.6-linux-x64.tar.xz \
     | tar -Jx -C /usr/local/lib --transform s/node-v14.17.6-linux-x64/nodejs/ \
     && rm -f node-v14.17.6-linux-x64.tar.xz \
     && npm install -g yarn

# Install Go and Mage
FROM nodejs as golang
ENV PATH "$PATH:/usr/local/go/bin:/root/go/bin"
RUN curl -s -N -L https://golang.org/dl/go1.17.1.linux-amd64.tar.gz \
     | tar -xz -C /usr/local/ \
     && rm -f go1.17.1.linux-amd64.tar.gz \
     && git clone https://github.com/magefile/mage \
     && cd /mage \
     && go run bootstrap.go

# Install Grafana
FROM golang as grafana
ENV PATH "$PATH:/usr/local/lib/nodejs/bin:/usr/local/go/bin:/root/go/bin"
ENV GOCACHE /circonus-irondb-datasource/.cache
ENV GF_PATHS_PROVISIONING "/var/lib/grafana/provisioning"
ENV GF_PATHS_PLUGINS "/var/lib/grafana/plugins"
ENV GF_APP_MODE "development"
ENV GF_SECURITY_ADMIN_PASSWORD "admin"
ENV GF_AUTH_BASIC_ENABLED "false"
ENV GF_AUTH_ANONYMOUS_ENABLED "true"
ENV GF_AUTH_ANONYMOUS_ORG_ROLE "Admin"
RUN curl -s -N https://dl.grafana.com/enterprise/release/grafana-enterprise-7.5.3.linux-amd64.tar.gz \
     | tar -xz -C /usr/local/lib --transform s/grafana-7.5.3/grafana/ \
     && rm -f grafana-enterprise-7.5.3.linux-amd64.tar.gz \
     && mkdir -p ${GF_PATHS_PLUGINS}/circonus-irondb-datasource \
     && mkdir -p ${GF_PATHS_PROVISIONING}/datasources \
     && mkdir -p /var/lib/grafana/dashboards


# Start
WORKDIR /
COPY entrypoint.sh /
ENTRYPOINT ["sh", "/entrypoint.sh" ]
