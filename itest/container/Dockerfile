FROM ubuntu:22.04

RUN \
  apt-get update

RUN \
  DEBIAN_FRONTEND=noninteractive apt-get install -yq \
    git \
    curl \
    apache2 \
    libappconfig-perl \
    libdate-calc-perl \
    libtemplate-perl \
    build-essential \
    libdatetime-timezone-perl \
    libdatetime-perl \
    libemail-sender-perl \
    libemail-mime-perl \
    libemail-mime-modifier-perl \
    libdbi-perl \
    libdbd-sqlite3-perl \
    libcgi-pm-perl \
    libmath-random-isaac-perl \
    libmath-random-isaac-xs-perl \
    libapache2-mod-perl2 \
    libapache2-mod-perl2-dev \
    libchart-perl \
    libxml-perl \
    libxml-twig-perl \
    perlmagick \
    libgd-graph-perl \
    libtemplate-plugin-gd-perl \
    libsoap-lite-perl \
    libhtml-scrubber-perl \
    libjson-rpc-perl \
    libdaemon-generic-perl \
    libtheschwartz-perl \
    libtest-taint-perl \
    libauthen-radius-perl \
    libfile-slurp-perl \
    libencode-detect-perl \
    libmodule-build-perl \
    libnet-ldap-perl \
    libauthen-sasl-perl \
    libfile-mimeinfo-perl \
    libhtml-formattext-withlinks-perl \
    libdatetime-timezone-perl \
    libemail-sender-perl \
    libemail-address-perl \
    libgd-dev \
    graphviz \
    sphinx-common

RUN \
  cd /var/www/html && \
  git clone --branch release-5.1.2 https://github.com/bugzilla/bugzilla bugzilla

WORKDIR /var/www/html/bugzilla

COPY bugzilla.conf /etc/apache2/sites-available/bugzilla.conf
COPY httpd-foreground backup-db restore-db /usr/local/bin/
COPY source.patch /var/www/html/bugzilla

RUN \
  chmod 755 /usr/local/bin/httpd-foreground && \
  a2ensite bugzilla && \
  a2enmod cgi headers expires rewrite

RUN \
  patch -p1 < source.patch && \
  ./checksetup.pl && \
  rm source.patch

ENV ADMIN_EMAIL="admin@nowhere.com"
ENV ADMIN_PASSWORD="adminpass"
ENV ADMIN_REALNAME="Insecure User"

EXPOSE 80
CMD ["httpd-foreground"]
