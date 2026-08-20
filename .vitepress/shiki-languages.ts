import type { LanguageRegistration } from "shiki"

export const caddyfileLanguage: LanguageRegistration = {
  name: "caddyfile",
  aliases: ["caddy", "Caddyfile"],
  scopeName: "source.caddyfile",
  displayName: "Caddyfile",
  patterns: [
    {
      name: "comment.line.number-sign.caddyfile",
      match: "(?:^|\\s)#.*$"
    },
    {
      name: "string.quoted.double.caddyfile",
      begin: '"',
      end: '"',
      patterns: [
        {
          name: "constant.character.escape.caddyfile",
          match: "\\\\."
        },
        {
          name: "variable.other.placeholder.caddyfile",
          match: "\\{[\\w\\.-]+\\}"
        }
      ]
    },
    {
      name: "string.quoted.single.caddyfile",
      begin: "'",
      end: "'",
      patterns: [
        {
          name: "constant.character.escape.caddyfile",
          match: "\\\\."
        }
      ]
    },
    {
      name: "variable.other.placeholder.caddyfile",
      match: "\\{[\\w\\.-]+\\}"
    },
    {
      name: "entity.name.tag.matcher.caddyfile",
      match: "@\\w+"
    },
    {
      name: "keyword.control.directive.caddyfile",
      match:
        "\\b(root|file_server|header|try_files|reverse_proxy|rewrite|redir|respond|route|handle|handle_path|handle_errors|encode|tls|log|import|abort|error|basicauth|templates|push|request_header|map|vars|intercept|bind|skip_log|metrics|tracing|copy_response|copy_response_headers|acme_server|authentication|forward_auth|http_port|https_port|order|storage|auto_https|admin|email|default_sni|debug|grace_period|local_certs|cert_issuer|servers)\\b"
    },
    {
      name: "support.function.matcher.caddyfile",
      match:
        "\\b(path|path_regexp|header|header_regexp|method|query|expression|remote_ip|client_ip|protocol|not|vars_regexp|file)\\b"
    },
    {
      name: "constant.language.boolean.caddyfile",
      match: "\\b(true|false|on|off|yes|no)\\b"
    },
    {
      name: "constant.numeric.caddyfile",
      match:
        "\\b\\d+(y|mo|w|d|h|m|s|ms|us|ns|B|kB|MB|GB|TB|KiB|MiB|GiB|TiB)?\\b"
    },
    {
      name: "constant.other.ip.caddyfile",
      match: "\\b(?:\\d{1,3}\\.){3}\\d{1,3}(?::\\d+)?\\b"
    }
  ]
}

export const bnfLanguage: LanguageRegistration = {
  name: "bnf",
  aliases: ["ebnf", "abnf"],
  scopeName: "source.bnf",
  displayName: "BNF",
  patterns: [
    {
      name: "comment.line.bnf",
      match: "(?:;|//|#).*$"
    },
    {
      name: "comment.block.bnf",
      begin: "/\\*|\\(\\*",
      end: "\\*/|\\*\\)"
    },
    {
      name: "string.quoted.double.bnf",
      begin: '"',
      end: '"',
      patterns: [
        {
          name: "constant.character.escape.bnf",
          match: "\\\\."
        }
      ]
    },
    {
      name: "string.quoted.single.bnf",
      begin: "'",
      end: "'",
      patterns: [
        {
          name: "constant.character.escape.bnf",
          match: "\\\\."
        }
      ]
    },
    {
      name: "string.quoted.backtick.bnf",
      begin: "`",
      end: "`"
    },
    {
      name: "keyword.operator.assignment.bnf",
      match: "::=|:=|=|->"
    },
    {
      name: "keyword.operator.bnf",
      match: "\\||\\*|\\+|\\?|,|;"
    },
    {
      name: "entity.name.type.non-terminal.bnf",
      match: "<[^>]+>|\\b[a-zA-Z_][a-zA-Z0-9_-]*(?=\\s*(::=|:=|=|->))"
    },
    {
      name: "variable.parameter.terminal.bnf",
      match: "\\b[a-zA-Z_][a-zA-Z0-9_-]*\\b"
    }
  ]
}
