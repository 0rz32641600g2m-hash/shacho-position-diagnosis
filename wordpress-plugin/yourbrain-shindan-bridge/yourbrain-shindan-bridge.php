<?php
/**
 * Plugin Name: YourBrain Shindan Bridge
 * Description: 社長の形勢診断の保存・一覧管理用ブリッジプラグイン。
 * Version: 0.1.0
 */

if (!defined('ABSPATH')) {
	exit;
}

final class YourBrain_Shindan_Bridge {
	private string $table_name;
	private string $token_option_name = 'yourbrain_shindan_api_token';
	private array $question_labels = [
		'revenueScale' => '年商規模',
		'industry' => '業種',
		'topConcerns' => '今一番の悩み',
		'cashMonths' => '手元資金は月商の何か月分ありますか',
		'profitStatus' => '直近の利益状況に近い感覚はどれですか',
		'cashAnxiety' => '資金繰りへの不安はありますか',
		'customerAcquisition' => '新規顧客獲得は安定していますか',
		'salesVisibility' => '売上の先行きはどれくらい見えていますか',
		'grossProfitVisibility' => '粗利の高い商品・低い商品を把握していますか',
		'monthlyTiming' => '月次の数字はいつ見られますか',
		'cashflowTable' => '資金繰り表はありますか',
		'decisionConfidence' => '数字をもとに採用・広告・投資判断ができていますか',
	];
	private array $option_labels = [
		'revenueScale' => [
			'under1' => '1億円未満',
			'1to3' => '1〜3億円',
			'3to10' => '3〜10億円',
			'10to30' => '10〜30億円',
			'30plus' => '30億円以上',
		],
		'industry' => [
			'manufacturing' => '製造業',
			'construction' => '建設業',
			'retail' => '小売業',
			'it_service' => 'IT・サービス業',
			'other' => 'その他',
		],
		'topConcerns' => [
			'cashflow' => '資金繰り',
			'profitability' => '利益が残らない',
			'growth' => '売上の伸び悩み',
			'acquisition' => '集客の不安定さ',
			'hiring' => '人材採用',
			'leadership' => '幹部育成',
			'visibility' => '数字が見えない',
			'investment' => '投資判断が難しい',
		],
		'cashMonths' => [
			'lt1' => '1か月未満',
			'1to2' => '1〜2か月',
			'3to6' => '3〜6か月',
			'6plus' => '6か月以上',
			'unknown' => '分からない',
		],
		'profitStatus' => [
			'strong_profit' => 'しっかり黒字',
			'slim_profit' => 'なんとか黒字',
			'break_even' => 'トントン',
			'loss' => '赤字気味',
			'unknown' => '分からない',
		],
		'cashAnxiety' => [
			'high' => '強い',
			'medium' => 'ややある',
			'low' => 'あまりない',
			'none' => 'ない',
		],
		'customerAcquisition' => [
			'stable' => '安定している',
			'volatile' => '月によって波が大きい',
			'referral' => '紹介頼み',
			'weak' => 'あまり取れていない',
		],
		'salesVisibility' => [
			'3months' => '3か月先まである程度見える',
			'1month' => '1か月先くらいまで',
			'unclear' => '読みにくい',
			'blind' => 'ほぼ見えない',
		],
		'grossProfitVisibility' => [
			'yes' => 'はい',
			'partial' => '一部だけ',
			'no' => 'いいえ',
		],
		'monthlyTiming' => [
			'10days' => '翌月10日以内',
			'20days' => '翌月20日以内',
			'month_end' => '翌月末以降',
			'rarely' => 'ほとんど見ていない',
		],
		'cashflowTable' => [
			'monthly' => '毎月更新している',
			'sometimes' => 'たまに作る',
			'none' => 'ない',
		],
		'decisionConfidence' => [
			'yes' => 'できている',
			'partial' => '一部できている',
			'no' => 'できていない',
		],
	];

	public function __construct() {
		global $wpdb;
		$this->table_name = $wpdb->prefix . 'yourbrain_shindan_submissions';

		register_activation_hook(__FILE__, [$this, 'activate']);
		add_action('rest_api_init', [$this, 'register_rest_routes']);
		add_action('admin_menu', [$this, 'register_admin_page']);
		add_action('admin_post_yourbrain_shindan_submit', [$this, 'handle_admin_post_submission']);
		add_action('admin_post_nopriv_yourbrain_shindan_submit', [$this, 'handle_admin_post_submission']);
		add_action('admin_post_yourbrain_shindan_fetch', [$this, 'handle_admin_post_fetch']);
		add_action('admin_post_nopriv_yourbrain_shindan_fetch', [$this, 'handle_admin_post_fetch']);
	}

	public function activate(): void {
		global $wpdb;

		require_once ABSPATH . 'wp-admin/includes/upgrade.php';

		$charset_collate = $wpdb->get_charset_collate();
		$sql = "CREATE TABLE {$this->table_name} (
			id varchar(64) NOT NULL,
			created_at datetime NOT NULL,
			company_name varchar(255) NOT NULL,
			contact_name varchar(255) NOT NULL,
			email varchar(255) NOT NULL,
			phone varchar(64) NULL,
			consent tinyint(1) NOT NULL DEFAULT 0,
			overall_phase varchar(64) NOT NULL,
			evaluation_value int NOT NULL,
			evaluation_label varchar(64) NOT NULL,
			grade varchar(8) NOT NULL,
			total_score int NOT NULL,
			answers longtext NOT NULL,
			result_json longtext NOT NULL,
			PRIMARY KEY  (id),
			KEY created_at (created_at),
			KEY email (email)
		) $charset_collate;";

		dbDelta($sql);
	}

	public function register_rest_routes(): void {
		register_rest_route('yourbrain-shindan/v1', '/submissions', [
			'methods' => 'POST',
			'callback' => [$this, 'create_submission'],
			'permission_callback' => [$this, 'authorize_api'],
		]);

		register_rest_route('yourbrain-shindan/v1', '/submissions/(?P<id>[a-zA-Z0-9\-]+)', [
			'methods' => 'GET',
			'callback' => [$this, 'get_submission'],
			'permission_callback' => [$this, 'authorize_api'],
		]);
	}

	public function authorize_api(): bool {
		if (current_user_can('manage_options')) {
			return true;
		}

		$configured_token = $this->get_api_token();
		$request_token = $this->get_request_token();

		if (!$configured_token || !$request_token) {
			return false;
		}

		return hash_equals($configured_token, $request_token);
	}

	private function get_api_token(): string {
		if (defined('YOURBRAIN_SHINDAN_API_TOKEN') && YOURBRAIN_SHINDAN_API_TOKEN) {
			return (string) YOURBRAIN_SHINDAN_API_TOKEN;
		}

		$env_token = getenv('YOURBRAIN_SHINDAN_API_TOKEN');

		if (is_string($env_token) && $env_token !== '') {
			return $env_token;
		}

		$option_token = get_option($this->token_option_name, '');

		return is_string($option_token) ? $option_token : '';
	}

	private function get_request_token(): string {
		$header_token = isset($_SERVER['HTTP_X_YOURBRAIN_SHINDAN_TOKEN'])
			? sanitize_text_field(wp_unslash($_SERVER['HTTP_X_YOURBRAIN_SHINDAN_TOKEN']))
			: '';

		if ($header_token !== '') {
			return $header_token;
		}

		$param_token = isset($_GET['token']) ? sanitize_text_field(wp_unslash($_GET['token'])) : '';

		return $param_token;
	}

	private function parse_submission_params($params): array {
		if (!is_array($params)) {
			return [];
		}

		$lead = isset($params['lead']) && is_array($params['lead']) ? $params['lead'] : [];
		$result = isset($params['result']) && is_array($params['result']) ? $params['result'] : [];

		return [
			'id' => sanitize_text_field($params['id'] ?? ''),
			'created_at' => gmdate('Y-m-d H:i:s', strtotime($params['createdAt'] ?? 'now')),
			'company_name' => sanitize_text_field($lead['companyName'] ?? ''),
			'contact_name' => sanitize_text_field($lead['contactName'] ?? ''),
			'email' => sanitize_email($lead['email'] ?? ''),
			'phone' => sanitize_text_field($lead['phone'] ?? ''),
			'consent' => !empty($lead['consent']) ? 1 : 0,
			'overall_phase' => sanitize_text_field($result['overallPhase'] ?? ''),
			'evaluation_value' => intval($result['evaluationValue'] ?? 0),
			'evaluation_label' => sanitize_text_field($result['evaluationLabel'] ?? ''),
			'grade' => sanitize_text_field($result['grade'] ?? ''),
			'total_score' => intval($result['totalScore'] ?? 0),
			'answers' => wp_json_encode($params['answers'] ?? [], JSON_UNESCAPED_UNICODE),
			'result_json' => wp_json_encode($result, JSON_UNESCAPED_UNICODE),
		];
	}

	private function insert_submission_row(array $params): void {
		global $wpdb;

		$wpdb->insert(
			$this->table_name,
			$this->parse_submission_params($params),
			['%s', '%s', '%s', '%s', '%s', '%s', '%d', '%s', '%d', '%s', '%s', '%d', '%s', '%s']
		);
	}

	public function create_submission(WP_REST_Request $request): WP_REST_Response {
		$params = $request->get_json_params();
		$this->insert_submission_row($params);

		return new WP_REST_Response(['id' => sanitize_text_field($params['id'])], 201);
	}

	public function handle_admin_post_submission(): void {
		if (!$this->authorize_api()) {
			status_header(403);
			wp_die('Forbidden');
		}

		$raw_payload = isset($_POST['payload']) ? wp_unslash($_POST['payload']) : file_get_contents('php://input');
		$params = json_decode($raw_payload, true);

		if (!is_array($params)) {
			wp_send_json(['error' => 'Invalid payload'], 400);
		}

		$this->insert_submission_row($params);
		wp_send_json(['id' => sanitize_text_field($params['id'] ?? '')], 201);
	}

	public function handle_admin_post_fetch(): void {
		if (!$this->authorize_api()) {
			status_header(403);
			wp_die('Forbidden');
		}

		$id = isset($_GET['id']) ? sanitize_text_field(wp_unslash($_GET['id'])) : '';
		$row = $this->get_submission_row($id);

		if (!$row) {
			wp_send_json(['message' => 'Not found'], 404);
		}

		wp_send_json($this->format_submission_response($row), 200);
	}

	private function get_submission_row(string $id): ?array {
		global $wpdb;

		$row = $wpdb->get_row($wpdb->prepare("SELECT * FROM {$this->table_name} WHERE id = %s", $id), ARRAY_A);

		return is_array($row) ? $row : null;
	}

	private function format_submission_response(array $row): array {
		return [
			'id' => $row['id'],
			'createdAt' => get_date_from_gmt($row['created_at'], DATE_ATOM),
			'lead' => [
				'companyName' => $row['company_name'],
				'contactName' => $row['contact_name'],
				'email' => $row['email'],
				'phone' => $row['phone'],
				'consent' => (bool) $row['consent'],
			],
			'answers' => json_decode($row['answers'], true),
			'result' => json_decode($row['result_json'], true),
		];
	}

	public function get_submission(WP_REST_Request $request): WP_REST_Response {
		$id = sanitize_text_field($request['id']);
		$row = $this->get_submission_row($id);

		if (!$row) {
			return new WP_REST_Response(['message' => 'Not found'], 404);
		}

		return new WP_REST_Response($this->format_submission_response($row), 200);
	}

	public function register_admin_page(): void {
		add_menu_page(
			'社長の形勢診断',
			'社長の形勢診断',
			'manage_options',
			'yourbrain-shindan',
			[$this, 'render_admin_page'],
			'dashicons-chart-line',
			26
		);
	}

	public function render_admin_page(): void {
		global $wpdb;
		$rows = $wpdb->get_results("SELECT * FROM {$this->table_name} ORDER BY created_at DESC LIMIT 100", ARRAY_A);
		$selected_id = isset($_GET['submission_id']) ? sanitize_text_field(wp_unslash($_GET['submission_id'])) : '';
		$selected_row = $selected_id ? $this->get_submission_row($selected_id) : null;
		$selected_submission = $selected_row ? $this->format_submission_response($selected_row) : null;
		?>
		<div class="wrap">
			<h1>社長の形勢診断 一覧</h1>
			<p>診断結果の概要と、各回答の中身を管理画面で確認できます。</p>

			<?php if ($selected_submission) : ?>
				<?php $this->render_submission_detail($selected_submission); ?>
			<?php endif; ?>

			<table class="widefat striped">
				<thead>
					<tr>
						<th>日時</th>
						<th>会社名</th>
						<th>お名前</th>
						<th>メール</th>
						<th>判定</th>
						<th>評価値</th>
						<th>スコア</th>
						<th>詳細</th>
					</tr>
				</thead>
				<tbody>
					<?php foreach ($rows as $row) : ?>
						<tr>
							<td><?php echo esc_html($row['created_at']); ?></td>
							<td><?php echo esc_html($row['company_name']); ?></td>
							<td><?php echo esc_html($row['contact_name']); ?></td>
							<td><?php echo esc_html($row['email']); ?></td>
							<td><?php echo esc_html($row['overall_phase']); ?></td>
							<td><?php echo esc_html($row['evaluation_value']); ?></td>
							<td><?php echo esc_html($row['grade']); ?> / <?php echo esc_html($row['total_score']); ?></td>
							<td>
								<a href="<?php echo esc_url(admin_url('admin.php?page=yourbrain-shindan&submission_id=' . rawurlencode($row['id']))); ?>">
									回答を見る
								</a>
							</td>
						</tr>
					<?php endforeach; ?>
				</tbody>
			</table>
		</div>
		<?php
	}

	private function render_submission_detail(array $submission): void {
		$result = isset($submission['result']) && is_array($submission['result']) ? $submission['result'] : [];
		$answers = isset($submission['answers']) && is_array($submission['answers']) ? $submission['answers'] : [];
		$scores = isset($result['scores']) && is_array($result['scores']) ? $result['scores'] : [];
		$next_moves = isset($result['nextMoves']) && is_array($result['nextMoves']) ? $result['nextMoves'] : [];
		$bad_moves = isset($result['badMoves']) && is_array($result['badMoves']) ? $result['badMoves'] : [];
		$insights = isset($result['insights']) && is_array($result['insights']) ? $result['insights'] : [];
		?>
		<div class="notice" style="padding: 20px; margin: 20px 0; background: #fff; border-left: 4px solid #1d4ed8;">
			<div style="display:flex; justify-content:space-between; gap:16px; align-items:flex-start; flex-wrap:wrap;">
				<div>
					<h2 style="margin:0 0 10px;">診断詳細: <?php echo esc_html($submission['lead']['companyName'] ?? ''); ?></h2>
					<p style="margin:0 0 6px;"><strong>お名前:</strong> <?php echo esc_html($submission['lead']['contactName'] ?? ''); ?></p>
					<p style="margin:0 0 6px;"><strong>メール:</strong> <?php echo esc_html($submission['lead']['email'] ?? ''); ?></p>
					<p style="margin:0;"><strong>診断日時:</strong> <?php echo esc_html($submission['createdAt'] ?? ''); ?></p>
				</div>
				<a class="button" href="<?php echo esc_url(admin_url('admin.php?page=yourbrain-shindan')); ?>">一覧へ戻る</a>
			</div>

			<div style="display:grid; grid-template-columns:repeat(auto-fit,minmax(180px,1fr)); gap:12px; margin-top:20px;">
				<?php $this->render_metric_card('総合判定', $result['grade'] ?? ''); ?>
				<?php $this->render_metric_card('現在の形勢', $result['evaluationLabel'] ?? ''); ?>
				<?php $this->render_metric_card('局面名', $result['overallPhase'] ?? ''); ?>
				<?php $this->render_metric_card('評価値', isset($result['evaluationValue']) ? (string) $result['evaluationValue'] : ''); ?>
				<?php $this->render_metric_card('総合スコア', isset($result['totalScore']) ? (string) $result['totalScore'] : ''); ?>
			</div>

			<div style="margin-top:24px;">
				<h3 style="margin-bottom:8px;">今の自社の状況</h3>
				<p style="margin:0 0 8px;"><?php echo esc_html($result['summaryComment'] ?? ''); ?></p>
				<p style="margin:0;"><strong>寸評:</strong> <?php echo esc_html($result['shortMessage'] ?? ''); ?></p>
			</div>

			<div style="display:grid; grid-template-columns:1fr 1fr; gap:20px; margin-top:24px;">
				<div>
					<h3 style="margin-bottom:8px;">読み筋</h3>
					<?php $this->render_definition_list([
						'良い点' => $insights['goodPoint'] ?? '',
						'注意点' => $insights['cautionPoint'] ?? '',
						'まずやること' => $insights['firstAction'] ?? '',
					]); ?>
				</div>
				<div>
					<h3 style="margin-bottom:8px;">局面を支える4項目</h3>
					<?php $this->render_scores_list($scores); ?>
				</div>
			</div>

			<div style="display:grid; grid-template-columns:1fr 1fr; gap:20px; margin-top:24px;">
				<div>
					<h3 style="margin-bottom:8px;">次の一手 候補</h3>
					<?php $this->render_moves_list($next_moves, true); ?>
				</div>
				<div>
					<h3 style="margin-bottom:8px;">悪手になる候補手</h3>
					<?php $this->render_moves_list($bad_moves, false); ?>
				</div>
			</div>

			<div style="margin-top:24px;">
				<h3 style="margin-bottom:8px;">回答内容</h3>
				<?php $this->render_answers_table($answers); ?>
			</div>
		</div>
		<?php
	}

	private function render_metric_card(string $label, string $value): void {
		?>
		<div style="border:1px solid #dbe2ea; border-radius:16px; padding:16px; background:#f8fafc;">
			<div style="font-size:12px; font-weight:700; color:#475569; letter-spacing:0.08em;"><?php echo esc_html($label); ?></div>
			<div style="margin-top:8px; font-size:24px; font-weight:700; color:#0f172a;"><?php echo esc_html($value); ?></div>
		</div>
		<?php
	}

	private function render_definition_list(array $items): void {
		echo '<dl style="margin:0;">';
		foreach ($items as $label => $value) {
			echo '<dt style="margin-top:12px; font-weight:700; color:#0f172a;">' . esc_html($label) . '</dt>';
			echo '<dd style="margin:6px 0 0; color:#334155;">' . esc_html($value) . '</dd>';
		}
		echo '</dl>';
	}

	private function render_scores_list(array $scores): void {
		if (empty($scores)) {
			echo '<p>スコア情報はありません。</p>';
			return;
		}

		echo '<table class="widefat striped"><thead><tr><th>項目</th><th>5段階</th><th>評価</th><th>説明</th></tr></thead><tbody>';
		foreach ($scores as $score) {
			echo '<tr>';
			echo '<td>' . esc_html($score['label'] ?? '') . '</td>';
			echo '<td>' . esc_html((string) ($score['level'] ?? '')) . '</td>';
			echo '<td>' . esc_html($score['tone'] ?? '') . '</td>';
			echo '<td>' . esc_html($score['description'] ?? '') . '</td>';
			echo '</tr>';
		}
		echo '</tbody></table>';
	}

	private function render_moves_list(array $moves, bool $is_positive): void {
		if (empty($moves)) {
			echo '<p>候補手はありません。</p>';
			return;
		}

		echo '<ol style="margin:0; padding-left:20px;">';
		foreach ($moves as $move) {
			$delta = isset($move['evaluationDelta']) ? (int) $move['evaluationDelta'] : 0;
			$formatted_delta = $is_positive && $delta > 0 ? '+' . $delta : (string) $delta;
			echo '<li style="margin-bottom:12px;">';
			echo '<div style="font-weight:700; color:#0f172a;">' . esc_html($move['title'] ?? '') . '</div>';
			if (!empty($move['categoryLabel'])) {
				echo '<div style="margin-top:4px; font-size:12px; color:#1d4ed8;">' . esc_html($move['categoryLabel']) . '</div>';
			}
			echo '<div style="margin-top:4px; font-size:12px; color:#475569;">評価値 ' . esc_html($formatted_delta) . ' / ' . esc_html($move['deltaLabel'] ?? '') . '</div>';
			echo '</li>';
		}
		echo '</ol>';
	}

	private function render_answers_table(array $answers): void {
		if (empty($answers)) {
			echo '<p>回答内容はありません。</p>';
			return;
		}

		echo '<table class="widefat striped"><thead><tr><th>設問</th><th>回答</th></tr></thead><tbody>';
		foreach ($this->question_labels as $key => $label) {
			$value = $answers[$key] ?? null;
			echo '<tr>';
			echo '<td>' . esc_html($label) . '</td>';
			echo '<td>' . esc_html($this->format_answer_value($key, $value)) . '</td>';
			echo '</tr>';
		}
		echo '</tbody></table>';
	}

	private function format_answer_value(string $key, $value): string {
		if (is_array($value)) {
			$labels = array_map(function ($item) use ($key) {
				return $this->option_labels[$key][$item] ?? (string) $item;
			}, $value);

			return implode(' / ', $labels);
		}

		if ($value === null || $value === '') {
			return '未回答';
		}

		return $this->option_labels[$key][$value] ?? (string) $value;
	}
}

new YourBrain_Shindan_Bridge();
