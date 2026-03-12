import {
  genDest,
  imageCDNs,
  retrieveAllMDs,
  retrieveTiDBMDsFromZip,
  retrieveCloudMDsFromZip,
  copyFilesFromToc,
  copyDirectorySync,
} from "./utils.js";
import {
  replaceCopyableStream,
  replaceImagePathStream,
} from "@pingcap/docs-content";

import { execSync } from "child_process";
import fs from "fs";
import { genContentFromOutline } from "./gen.js";
import { handleSync } from "./sync.js";
import nPath from "path";
import rimraf from "rimraf";
import sig from "signale";

const DEFAULT_BRANCH_MAPPINGS = {
  "feature/preview-top-navigation": {
    "pingcap/docs": "release-8.5",
    "pingcap/docs-cn": "release-8.5",
    "pingcap/docs-tidb-operator": "main",
    "tidbcloud/dbaas-docs": "master",
  },
};

const BRANCH_MAPPING_ENV_KEYS = [
  "BRANCH_MAPPING",
  "DOCS_DOWNLOAD_BRANCH_MAPPING",
];

function normalizeBranchMappings(rawBranchMappings) {
  if (!rawBranchMappings) {
    return [];
  }

  const mappingList = Array.isArray(rawBranchMappings)
    ? rawBranchMappings
    : [rawBranchMappings];

  return mappingList
    .flatMap((mapping) => String(mapping).split(/\r?\n|,/))
    .map((mapping) => mapping.trim())
    .filter(Boolean);
}

function parseBranchMappings(rawBranchMappings) {
  return normalizeBranchMappings(rawBranchMappings).reduce((mappings, item) => {
    const separatorIndex = item.indexOf(":");

    if (separatorIndex === -1) {
      sig.warn("Ignore invalid branch mapping:", item);
      return mappings;
    }

    const sourceRef = item.slice(0, separatorIndex).trim();
    const targetRef = item.slice(separatorIndex + 1).trim();

    if (!sourceRef || !targetRef) {
      sig.warn("Ignore invalid branch mapping:", item);
      return mappings;
    }

    mappings[sourceRef] = targetRef;
    return mappings;
  }, {});
}

function getBranchMappings(argv) {
  const envBranchMappings = BRANCH_MAPPING_ENV_KEYS.map(
    (key) => process.env[key]
  ).filter(Boolean);

  return parseBranchMappings(
    argv.branchMapping?.length ? argv.branchMapping : envBranchMappings
  );
}

function resolveDestRef(repo, ref, branchMappings = {}) {
  if (branchMappings[ref]) {
    return branchMappings[ref];
  }

  return DEFAULT_BRANCH_MAPPINGS[ref]?.[repo] ?? ref;
}

function genOptions(repo, config, dryRun) {
  const options = {
    pipelines: [
      () => replaceImagePathStream(imageCDNs[repo.split("/")[1]]),
      replaceCopyableStream,
    ],
    dryRun,
  };

  if (config) {
    let contents;
    try {
      contents = fs.readFileSync(config);
    } catch (err) {
      return options;
    }

    options.ignore = JSON.parse(contents).ignore;
  }

  return options;
}

function renameDoc(repo) {
  switch (repo) {
    case "pingcap/docs-dm":
      return "tidb-data-migration";
    case "pingcap/docs-tidb-operator":
      return "tidb-in-kubernetes";
  }
}

export function download(argv) {
  const { repo, path, ref, destination, config, dryRun } = argv;
  const dest = nPath.resolve(destination);
  const options = genOptions(repo, config, dryRun);
  const destRef = resolveDestRef(repo, ref, getBranchMappings(argv));

  switch (repo) {
    case "pingcap/docs-cn":
      const docsCnDestPath = genDest(
        repo,
        path,
        nPath.resolve(
          dest,
          `${repo.endsWith("-cn") ? "zh" : "en"}/tidb/${destRef}`
        )
      );
      rimraf.sync(docsCnDestPath);
      retrieveTiDBMDsFromZip(
        {
          repo,
          path,
          ref,
        },
        docsCnDestPath,
        options
      );
      break;
    case "pingcap/docs":
      if (ref.startsWith("i18n-")) {
        const refDataList = ref.split("-");
        refDataList.shift();
        const refLang = refDataList.shift();
        const refVer = refDataList.join("-");
        const docsDestPath = genDest(
          repo,
          path,
          nPath.resolve(dest, `${refLang}/tidb/${refVer}`)
        );
        rimraf.sync(docsDestPath);
        retrieveTiDBMDsFromZip(
          {
            repo,
            path,
            ref,
          },
          docsDestPath,
          options
        );
      } else {
        const docsDestPath = genDest(
          repo,
          path,
          nPath.resolve(
            dest,
            `${repo.endsWith("-cn") ? "zh" : "en"}/tidb/${destRef}`
          )
        );
        rimraf.sync(docsDestPath);
        retrieveTiDBMDsFromZip(
          {
            repo,
            path,
            ref,
          },
          docsDestPath,
          options
        );
      }
      break;
    case "pingcap/docs-dm":
    case "pingcap/docs-tidb-operator":
      if (!path) {
        sig.warn(
          "For docs-dm/docs-tidb-operator/docs-appdev, you must provide en or zh path."
        );

        return;
      }

      const name = renameDoc(repo);
      const dmOpDestPath = genDest(
        repo,
        path,
        nPath.resolve(dest, `${path.split("/")[0]}/${name}/${destRef}`)
      );
      rimraf.sync(dmOpDestPath);

      retrieveAllMDs(
        {
          repo,
          path,
          ref,
        },
        dmOpDestPath,
        options
      );

      break;
    default:
      // ! TO REMOVE
      retrieveTiDBMDsFromZip(
        {
          repo,
          path,
          ref,
        },
        genDest(
          repo,
          path,
          nPath.resolve(
            dest,
            `${repo.endsWith("-cn") ? "zh" : "en"}/tidb/master`
          )
        ),
        options
      );
      break;
  }
}

export const clean = rimraf;

export function sync(argv) {
  const { repo, ref, base, head, destination, config, dryRun } = argv;
  const dest = nPath.resolve(destination);
  const options = genOptions(repo, config, dryRun);
  const destRef = resolveDestRef(repo, ref, getBranchMappings(argv));

  switch (repo) {
    case "pingcap/docs":
      if (ref.startsWith("i18n-")) {
        const refDataList = ref.split("-");
        refDataList.shift();
        const refLang = refDataList.shift();
        const refVer = refDataList.join("-");
        handleSync(
          {
            repo,
            ref,
            base,
            head,
          },
          nPath.resolve(dest, `${refLang}/tidb/${refVer}`),
          options
        );
      } else {
        handleSync(
          {
            repo,
            ref,
            base,
            head,
          },
          nPath.resolve(dest, `en/tidb/${destRef}`),
          options
        );
      }
      break;
    case "pingcap/docs-cn":
      handleSync(
        {
          repo,
          ref,
          base,
          head,
        },
        nPath.resolve(
          dest,
          `${repo.endsWith("-cn") ? "zh" : "en"}/tidb/${destRef}`
        ),
        options
      );
      break;
    case "pingcap/docs-dm":
    case "pingcap/docs-tidb-operator":
      const name = renameDoc(repo);

      handleSync(
        {
          repo,
          ref,
          base,
          head,
        },
        nPath.resolve(dest, `en/${name}/${destRef}`), // use en as a placeholder
        options
      );

      break;
  }
}

export function gen(argv) {
  const { repo, ref, from, output } = argv;
  const repoDest = `${nPath.dirname(from)}/${repo}`;

  if (!fs.existsSync(repoDest)) {
    sig.start("Clone", repoDest, "...");

    execSync(
      `git clone git@github.com:${repo}.git ${repoDest} --branch ${ref} --depth 1`,
      { stdio: "inherit" }
    );
  }

  genContentFromOutline(repo, from, output);
}

// export function filterCloud(argv) {
//   const { repo, path, ref, destination, lang } = argv;
//   const dest = nPath.resolve(destination);
//   const srcPath = genDest(
//     repo,
//     path,
//     nPath.resolve(dest, `${lang}/tidb/${ref}`)
//   );
//   const destPath = nPath.resolve(dest, `${lang}/tidbcloud/master`);
//   copyFilesFromToc(`${srcPath}/TOC-tidb-cloud.md`, `${destPath}`);
//   copyDirectorySync(`${srcPath}/tidb-cloud`, `${destPath}/tidb-cloud/`);
//   fs.existsSync(`${srcPath}/tidb-cloud`) &&
//     fs.rmSync(`${srcPath}/tidb-cloud`, { recursive: true });
// }
export function filterCloud(argv) {
  const {
    repo = "pingcap/docs",
    path,
    ref,
    destination,
    lang,
    config,
    dryRun,
  } = argv;
  const dest = nPath.resolve(destination);
  const options = genOptions(repo, config, dryRun);
  const docsDestPath = genDest(
    repo,
    path,
    nPath.resolve(dest, `${lang}/tidbcloud/master`)
  );
  rimraf.sync(docsDestPath);
  retrieveCloudMDsFromZip(
    {
      repo,
      path,
      ref,
    },
    docsDestPath,
    options
  );
}
