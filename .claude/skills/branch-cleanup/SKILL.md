---
name: branch-cleanup
description: 머지가 끝난 브랜치를 안전을 확인한 뒤 원격과 로컬에서 지운다. "브랜치 정리", "브랜치 지워줘", "머지된 브랜치 정리해줘", "clean up branches", "delete merged branches", "브랜치가 너무 많아" 라고 하거나 PR 을 머지한 직후 실행한다.
---

이 저장소는 **squash 머지**를 쓴다. 그래서 머지된 브랜치의 커밋은 `release` 의 조상이
아니고, `git branch -d` 도 `git branch --merged` 도 그것을 "머지됨" 으로 보지 않는다.
**git 의 조상 판정으로는 안전을 증명할 수 없다.** 이 스킬은 대신 무엇을 보고 판정하는지,
그리고 지우는 순서를 정한다.

## 언제 이 스킬을 쓰는가

- PR 을 머지한 직후 — 그 브랜치를 남길 이유가 없다
- `git branch -r` 에 머지된 브랜치가 쌓여 있을 때
- `gh pr merge --delete-branch` 가 실패해 브랜치가 남았을 때
- 실험하다 만 로컬 브랜치를 치울 때

## 언제 쓰지 않는가

- 브랜치를 **만들거나** PR 을 어디로 올릴지 정할 때 → `curvez:branching` 을 쓴다
- 커밋을 쌓고 PR 을 여는 절차 → `curvez:commit` 을 쓴다
- `release` · `main` 처럼 `protectedBranches` 에 있는 브랜치 → **이 스킬의 대상이 아니다.**
  지우지 않는다
- 워크트리가 체크아웃하고 있는 브랜치 → 먼저 워크트리를 정리한다.
  `git worktree list` 로 확인한다

**이유:** 만들기와 지우기를 한 스킬에 두면 "브랜치" 라는 말에 둘 다 반응해서, 새 작업을
시작하려는 발화에 정리 절차가 끼어든다. 되돌리기 비용이 다른 두 일이므로 경계를 나눈다.

## 무엇을 보고 안전하다고 판정하는가

**PR 이 `MERGED` 인 것 하나다.**

```bash
gh pr list --state merged --head "$B" --json number,state -q '.[0] | "\(.number):\(.state)"'
```

`MERGED` 면 GitHub 이 그 브랜치의 diff 를 base 에 적용했고, **PR 화면에 `Restore branch`
버튼이 남는다.** 지워도 되돌릴 자리가 있다는 뜻이다.

**`git branch --merged` 의 결과로 판정하지 마라.**
**이유:** squash 머지는 커밋을 재작성하므로 원래 커밋이 조상이 되지 않는다. 실제로 이
저장소에서 머지된 브랜치 4개가 전부 `--merged` 목록에 없었다. 그것을 "안 머지됨" 으로
읽으면 영영 못 지운다.

**`git log release..<branch>` 가 비어 있는지로도 판정하지 마라.**
**이유:** 같은 이유로 항상 비어 있지 않다. squash 머지에서 이 값은 0 이 되지 않는다.

PR 이 없는 브랜치(로컬 실험, 백업)는 **내용으로** 판정한다. 트리 해시가 같으면 사본이다.

```bash
git rev-parse "$B^{tree}"          # 같으면 파일 내용이 동일하다
git rev-parse "origin/main^{tree}"
```

## 절차

### 1. 대상을 모은다

```bash
git fetch --prune
git branch -vv          # [gone] 표시가 붙은 것이 우선 후보다
gh pr list --state merged --limit 20 --json number,headRefName -q '.[] | "\(.number) \(.headRefName)"'
```

`protectedBranches`(`.curvez/profile.json` 의 `git.protectedBranches`)와
`git worktree list` 에 나오는 브랜치를 목록에서 뺀다.

### 2. 브랜치마다 안전을 확인한다

위 `## 무엇을 보고` 의 명령을 돌린다. **`MERGED` 를 확인하지 못한 브랜치는 목록에서 뺀다.**
확인 결과를 출력으로 남긴다 — 지운 뒤에는 무엇을 근거로 지웠는지 물어볼 수 없다.

### 3. 원격을 지운다

가장 좋은 자리는 **머지하는 순간**이다.

```bash
gh pr merge <번호> --squash --delete-branch
```

이미 머지돼 브랜치만 남았으면 같은 동작을 마저 한다.

```bash
gh api -X DELETE "repos/<owner>/<repo>/git/refs/heads/$B"
```

**`git push --delete` 를 쓰지 마라. 가드가 막는다.**
**이유:** 가드는 원격 이력이 복구 불가능하게 사라지는 것을 막는다. 머지된 PR 의 head
브랜치는 그 경우가 아니다 — PR 화면에서 복원된다. 그래서 `gh` 로 하는 것은 우회가 아니라
`--delete-branch` 가 하려던 일을 마저 하는 것이다. **머지가 확인되지 않은 브랜치에는
이 명령을 쓰지 않는다.** 그때는 가드의 판단이 맞다.

### 4. 로컬을 지운다

```bash
git switch <다른 브랜치>          # 지울 브랜치 위에 서 있으면 지워지지 않는다
git branch --delete "$B"          # squash 머지면 거부된다. 그건 정상이다
```

거부되면 `-D` 가 필요한데 **가드가 막는다. 우회하지 마라.**
명령을 만들어 사용자에게 넘기고, 2단계에서 확인한 근거를 함께 보여준다.

```
아래는 가드가 막는다. 직접 실행해 달라.
PR #10 · #11 이 MERGED 임을 확인했고 원격 브랜치는 이미 지웠다.

  git branch -D feature/x fix/y
```

### 5. 확인한다

```bash
git fetch --prune
git branch -a
```

## 규칙

**한 번에 하나씩 지우고 결과를 출력한다.** 여러 개를 한 줄에 몰아 지우지 않는다.
**이유:** 중간에 하나가 실패해도 나머지가 지워진다. 그때 무엇이 남고 무엇이 사라졌는지
출력이 없으면 다시 조사해야 한다.

**`main` 과 `release` 는 대상이 아니다.** 목록을 만들 때부터 뺀다.

**워크트리가 잡고 있는 브랜치는 건드리지 않는다.**
**이유:** 다른 작업이 그 위에서 돌고 있다. 실제로 `gh pr merge --delete-branch` 가
`release` 를 다른 워크트리가 잡고 있어 로컬 단계에서 실패했고, 그 바람에 원격 브랜치도
남았다 — gh 는 로컬 정리에 실패하면 거기서 멈춘다.

**지운 뒤 되돌릴 자리를 함께 알린다.** 원격은 PR 화면의 `Restore branch`,
로컬은 `git reflog` 다.

## 완료 기준

- [ ] 지운 브랜치마다 `MERGED` 확인 출력이 남아 있다 (PR 없는 브랜치는 트리 해시 비교)
- [ ] `protectedBranches` 와 워크트리 브랜치가 목록에 들어가지 않았다
- [ ] `git fetch --prune && git branch -a` 에 정리 대상이 남아 있지 않다
- [ ] 가드에 막힌 명령은 **사용자에게 제시했고**, 우회한 흔적이 없다
- [ ] `git worktree list` 가 실행 전과 같다
