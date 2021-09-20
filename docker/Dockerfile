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
RUN yum install -y curl wget initscripts urw-fonts git

# Install Node.js
FROM distro as nodejs
ENV PATH "$PATH:/usr/local/lib/nodejs/bin"
RUN curl -s -N https://nodejs.org/dist/v14.17.6/node-v14.17.6-linux-x64.tar.xz | tar -Jx -C /usr/local/lib --transform s/node-v14.17.6-linux-x64/nodejs/ \
     && npm install -g yarn

# Install Go and Mage
FROM nodejs as golang
ENV PATH "$PATH:/usr/local/go/bin"
RUN curl -s -N -L https://golang.org/dl/go1.17.1.linux-amd64.tar.gz | tar -xz -C /usr/local/
RUN git clone https://github.com/magefile/mage
WORKDIR /mage
RUN go run bootstrap.go

# Build plugin
FROM golang as pluginbuild
ENV PATH "$PATH:/usr/local/lib/nodejs/bin:/usr/local/go/bin:/root/go/bin"
WORKDIR /root
ADD https://api.github.com/repos/circonus-labs/circonus-irondb-datasource/git/refs/heads/master version.json
RUN git clone https://github.com/circonus-labs/circonus-irondb-datasource/
WORKDIR /root/circonus-irondb-datasource
RUN yarn install \
     && yarn build \
     && mage -v

# Sign plugin
FROM pluginbuild as pluginsign
WORKDIR /root/circonus-irondb-datasource
ARG GRAFANA_API_KEY
ENV GRAFANA_API_KEY=$GRAFANA_API_KEY
RUN node $(find . -type f -iname "grafana-toolkit.js") plugin:sign --rootUrls http://localhost:3000/
ARG CIRCONUS_API_KEY
ENV CIRCONUS_API_KEY=$CIRCONUS_API_KEY 
RUN sed -i "s/@@CIRCONUS_API_KEY@@/$CIRCONUS_API_KEY/g" /root/circonus-irondb-datasource/docker/provisioning/datasources/irondb.yaml

# Install Grafana
FROM distro as grafana
RUN curl -s -N https://dl.grafana.com/enterprise/release/grafana-enterprise-7.5.3.linux-amd64.tar.gz | tar -xz -C /usr/local/lib --transform s/grafana-7.5.3/grafana/
ARG CIRCONUS_API_KEY
ENV CIRCONUS_API_KEY=$CIRCONUS_API_KEY 
COPY --from=pluginsign "/root/circonus-irondb-datasource/dist" "/usr/local/lib/grafana/data/plugins/circonus-irondb-datasource"
COPY --from=pluginsign "/root/circonus-irondb-datasource/docker/provisioning" "/var/lib/grafana/provisioning"
COPY --from=pluginsign "/root/circonus-irondb-datasource/docker/dashboards" "/var/lib/grafana/dashboards"
ENV GF_PATHS_PROVISIONING "/var/lib/grafana/provisioning"
ENV GF_SECURITY_ADMIN_PASSWORD=admin
ENV GF_AUTH_BASIC_ENABLED=false
ENV GF_AUTH_ANONYMOUS_ENABLED=true
ENV GF_AUTH_ANONYMOUS_ORG_ROLE=Admin

# Start Grafana
WORKDIR /usr/local/lib/grafana
COPY entrypoint.sh /
ENTRYPOINT ["sh", "/entrypoint.sh" ]
