import {
  genDest,
  imageCDNs,
  retrieveAllMDs,
  retrieveTiDBMDsFromZip,
  retrieveCloudMDsFromZip,
  copyFilesFromToc,
  copyDirectorySync,
  validateRepo,
  validateRef,
  validateLang,
  validateSubPath,
  resolveSafeChildPath,
} from "./utils.js";
import {
  replaceCopyableStream,
  replaceImagePathStream,
} from "@pingcap/docs-content";

import { execFileSync } from "child_process";
import fs from "fs";
import { genContentFromOutline } from "./gen.js";
import { handleSync } from "./sync.js";
import nPath from "path";
import rimraf from "rimraf";
import sig from "signale";

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
  const safeRepo = validateRepo(repo);
  const safeRef = validateRef(ref);
  const safePath = validateSubPath(path);
  const dest = nPath.resolve(destination);
  const options = genOptions(safeRepo, config, dryRun);

  switch (safeRepo) {
    case "pingcap/docs-cn": {
      const docsCnLang = validateLang(safeRepo.endsWith("-cn") ? "zh" : "en");
      const docsCnBaseDir = resolveSafeChildPath(
        dest,
        docsCnLang,
        "tidb",
        safeRef
      );
      const docsCnDestPath = genDest(safeRepo, safePath, docsCnBaseDir);
      rimraf.sync(docsCnDestPath);
      retrieveTiDBMDsFromZip(
        {
          repo: safeRepo,
          path: safePath,
          ref: safeRef,
        },
        docsCnDestPath,
        options
      );
      break;
    }
    case "pingcap/docs":
      if (safeRef.startsWith("i18n-")) {
        const refDataList = safeRef.split("-");
        refDataList.shift();
        const refLang = validateLang(refDataList.shift());
        const refVer = validateRef(refDataList.join("-"));
        const i18nBaseDir = resolveSafeChildPath(
          dest,
          refLang,
          "tidb",
          refVer
        );
        const docsDestPath = genDest(safeRepo, safePath, i18nBaseDir);
        rimraf.sync(docsDestPath);
        retrieveTiDBMDsFromZip(
          {
            repo: safeRepo,
            path: safePath,
            ref: safeRef,
          },
          docsDestPath,
          options
        );
      } else {
        const docsLang = validateLang(safeRepo.endsWith("-cn") ? "zh" : "en");
        const docsBaseDir = resolveSafeChildPath(
          dest,
          docsLang,
          "tidb",
          safeRef
        );
        const docsDestPath = genDest(safeRepo, safePath, docsBaseDir);
        rimraf.sync(docsDestPath);
        retrieveTiDBMDsFromZip(
          {
            repo: safeRepo,
            path: safePath,
            ref: safeRef,
          },
          docsDestPath,
          options
        );
      }
      break;
    case "pingcap/docs-dm":
    case "pingcap/docs-tidb-operator": {
      if (!safePath) {
        sig.warn(
          "For docs-dm/docs-tidb-operator/docs-appdev, you must provide en or zh path."
        );

        return;
      }

      const dmOpLang = validateLang(safePath.split("/")[0]);
      const name = renameDoc(safeRepo);
      const dmOpBaseDir = resolveSafeChildPath(
        dest,
        dmOpLang,
        name,
        safeRef
      );
      const dmOpDestPath = genDest(safeRepo, safePath, dmOpBaseDir);
      rimraf.sync(dmOpDestPath);

      retrieveAllMDs(
        {
          repo: safeRepo,
          path: safePath,
          ref: safeRef,
        },
        dmOpDestPath,
        options
      );

      break;
    }
    default: {
      // ! TO REMOVE
      const defaultLang = validateLang(safeRepo.endsWith("-cn") ? "zh" : "en");
      const defaultBaseDir = resolveSafeChildPath(
        dest,
        defaultLang,
        "tidb",
        "master"
      );
      retrieveTiDBMDsFromZip(
        {
          repo: safeRepo,
          path: safePath,
          ref: safeRef,
        },
        genDest(safeRepo, safePath, defaultBaseDir),
        options
      );
      break;
    }
  }
}

export const clean = rimraf;

export function sync(argv) {
  const { repo, ref, base, head, destination, config, dryRun } = argv;
  const safeRepo = validateRepo(repo);
  const safeRef = validateRef(ref);
  const dest = nPath.resolve(destination);
  const options = genOptions(safeRepo, config, dryRun);

  switch (safeRepo) {
    case "pingcap/docs":
      if (safeRef.startsWith("i18n-")) {
        const refDataList = safeRef.split("-");
        refDataList.shift();
        const refLang = validateLang(refDataList.shift());
        const refVer = validateRef(refDataList.join("-"));
        handleSync(
          {
            repo: safeRepo,
            ref: safeRef,
            base,
            head,
          },
          resolveSafeChildPath(dest, refLang, "tidb", refVer),
          options
        );
      } else {
        handleSync(
          {
            repo: safeRepo,
            ref: safeRef,
            base,
            head,
          },
          resolveSafeChildPath(dest, "en", "tidb", safeRef),
          options
        );
      }
      break;
    case "pingcap/docs-cn": {
      const syncLang = validateLang(safeRepo.endsWith("-cn") ? "zh" : "en");
      handleSync(
        {
          repo: safeRepo,
          ref: safeRef,
          base,
          head,
        },
        resolveSafeChildPath(dest, syncLang, "tidb", safeRef),
        options
      );
      break;
    }
    case "pingcap/docs-dm":
    case "pingcap/docs-tidb-operator": {
      const name = renameDoc(safeRepo);

      handleSync(
        {
          repo: safeRepo,
          ref: safeRef,
          base,
          head,
        },
        resolveSafeChildPath(dest, "en", name, safeRef), // use en as a placeholder
        options
      );

      break;
    }
  }
}

export function gen(argv) {
  const { repo, ref, from, output } = argv;
  const safeRepo = validateRepo(repo);
  const safeRef = validateRef(ref);
  const repoDest = resolveSafeChildPath(nPath.dirname(from), safeRepo);

  if (!fs.existsSync(repoDest)) {
    sig.start("Clone", repoDest, "...");

    execFileSync(
      "git",
      [
        "clone",
        `git@github.com:${safeRepo}.git`,
        repoDest,
        "--branch",
        safeRef,
        "--depth",
        "1",
      ],
      { stdio: "inherit" }
    );
  }

  genContentFromOutline(safeRepo, from, output);
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
    lang = "en",
    config,
    dryRun,
  } = argv;
  const safeRepo = validateRepo(repo);
  const safeRef = validateRef(ref);
  const safeLang = validateLang(lang);
  const safePath = validateSubPath(path);
  const dest = nPath.resolve(destination);
  const options = genOptions(safeRepo, config, dryRun);
  const cloudBaseDir = resolveSafeChildPath(
    dest,
    safeLang,
    "tidbcloud",
    "master"
  );
  const docsDestPath = genDest(safeRepo, safePath, cloudBaseDir);
  rimraf.sync(docsDestPath);
  retrieveCloudMDsFromZip(
    {
      repo: safeRepo,
      path: safePath,
      ref: safeRef,
    },
    docsDestPath,
    options
  );
}
